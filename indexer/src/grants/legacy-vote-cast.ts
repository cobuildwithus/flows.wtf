import { ponder, type Context, type Event } from "ponder:registry"
import { handleIncomingFlowRates } from "./lib/handle-incoming-flow-rates"
import { allocations, grants, allocationsByAllocationKeyAndContract } from "ponder:schema"
import { getGrantIdFromFlowContractAndRecipientId } from "./grant-helpers"
import { base, mainnet } from "../../addresses"

ponder.on("NounsFlow:VoteCast", handleAllocationCast)
ponder.on("NounsFlowChildren:VoteCast", handleAllocationCast)

/**
 * DEPRECATED EVENT HANDLER
 *
 * This AllocationCast event is deprecated in new FlowsV2 contracts.
 * For all intents and purposes, we treat tokenId as the allocationKey
 * in this legacy implementation.
 *
 * New contracts use AllocationSet event instead.
 */

async function handleAllocationCast(params: {
  event: Event<"NounsFlow:VoteCast">
  context: Context<"NounsFlow:VoteCast">
}) {
  const { event, context } = params
  const { recipientId, tokenId, bps, totalWeight } = event.args
  const chainId = context.chain.id

  const blockNumber = event.block.number.toString()
  const blockTimestamp = Number(event.block.timestamp)
  const transactionHash = event.transaction.hash
  const allocator = event.transaction.from.toLowerCase()
  const contract = event.log.address.toLowerCase() as `0x${string}`
  const allocationsCount = bps / (totalWeight / BigInt(1e18))

  const affectedRecipientIds = new Map<string, bigint>()
  affectedRecipientIds.set(recipientId.toString(), allocationsCount)

  let hasPreviousAllocations = false

  await updateTotalAllocationWeightCastOnFlow(context.db, contract, tokenId, totalWeight)
  const flow = await context.db.find(grants, { id: contract })
  if (!flow) throw new Error(`Flow not found: ${contract}`)

  // Mark old allocations for this token as stale
  const oldAllocations = await getOldAllocations(context.db, contract, tokenId, blockNumber)

  for (const oldAllocation of oldAllocations) {
    const existingAllocations = affectedRecipientIds.get(oldAllocation.recipientId) ?? BigInt(0)
    affectedRecipientIds.set(
      oldAllocation.recipientId,
      existingAllocations - BigInt(oldAllocation.allocationsCount)
    )
    hasPreviousAllocations = true
  }

  const allocationId = `${contract}_${recipientId}_${allocator}_${blockNumber}_${tokenId}`

  // Create the new allocation
  await context.db.insert(allocations).values({
    id: allocationId,
    chainId,
    contract,
    recipientId: recipientId.toString(),
    allocationKey: tokenId.toString(),
    bps: Number(bps),
    strategy: mainnet.NounsToken, // MANUAL OVERRIDE
    allocator,
    blockNumber,
    blockTimestamp,
    transactionHash,
    allocationsCount: allocationsCount.toString(),
  })

  await context.db
    .insert(allocationsByAllocationKeyAndContract)
    .values({
      contractAllocationKey: `${contract}_${tokenId}`,
      allocationIds: [allocationId],
    })
    .onConflictDoUpdate((row) => ({
      allocationIds: Array.from(new Set([...row.allocationIds, allocationId])),
    }))

  for (const [recipientId, allocationsDelta] of affectedRecipientIds) {
    const grantId = await getGrantIdFromFlowContractAndRecipientId(
      context.db,
      contract,
      recipientId
    )

    await context.db.update(grants, { id: grantId }).set((row) => ({
      allocationsCount: (BigInt(row.allocationsCount) + allocationsDelta).toString(),
    }))
  }

  // if is a new allocationr, then we are adding new member units to the total
  // so must handle all sibling flow rates
  if (!hasPreviousAllocations) {
    await handleIncomingFlowRates(context.db, contract)
  }
}

async function updateTotalAllocationWeightCastOnFlow(
  db: Context["db"],
  contract: `0x${string}`,
  allocationKey: bigint,
  totalWeight: bigint
) {
  const grantId = contract
  if (grantId) {
    const existingAllocationIds = await db.find(allocationsByAllocationKeyAndContract, {
      contractAllocationKey: `${contract}_${allocationKey}`,
    })
    if (!existingAllocationIds || existingAllocationIds.allocationIds.length === 0) {
      await db.update(grants, { id: grantId }).set((row) => ({
        totalAllocationWeightOnFlow: (
          BigInt(row.totalAllocationWeightOnFlow) + totalWeight
        ).toString(),
      }))
    }
  }
}

async function getOldAllocations(
  db: Context["db"],
  contract: `0x${string}`,
  allocationKey: bigint,
  blockNumber: string
) {
  const existingAllocationIds = await db.find(allocationsByAllocationKeyAndContract, {
    contractAllocationKey: `${contract}_${allocationKey}`,
  })

  if (!existingAllocationIds) return []

  const existingAllocationsRaw = await Promise.all(
    existingAllocationIds.allocationIds.map((allocationId) =>
      db.find(allocations, { id: allocationId })
    )
  )

  // filter out nulls
  const existingAllocationsNotNull = existingAllocationsRaw.filter(
    (allocation) => allocation !== undefined && allocation !== null
  )

  // include allocations that come before the latest allocation block number
  // since all allocationscast events happen in the same block per allocation
  const oldAllocations = existingAllocationsNotNull.filter(
    (allocation) => allocation.blockNumber !== blockNumber
  )

  // delete all old allocations
  await Promise.all(
    oldAllocations.map((allocation) => db.delete(allocations, { id: allocation.id }))
  )

  await db
    .update(allocationsByAllocationKeyAndContract, {
      contractAllocationKey: `${contract}_${allocationKey}`,
    })
    .set((row) => ({
      allocationIds: row.allocationIds.filter(
        (allocationId) => !oldAllocations.some((oldAllocation) => oldAllocation.id === allocationId)
      ),
    }))

  return oldAllocations
}
