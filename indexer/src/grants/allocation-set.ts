import { ponder, type Context, type Event } from "ponder:registry"
import {
  allocations,
  grants,
  allocationsByAllocationKeyAndContract,
  allocLastBlockByKey,
} from "ponder:schema"
import { getGrantIdFromFlowContractAndRecipientId } from "./grant-helpers"

ponder.on("CustomFlow:AllocationSet", handleAllocationSet)

async function handleAllocationSet(params: {
  event: Event<"CustomFlow:AllocationSet">
  context: Context<"CustomFlow:AllocationSet">
}) {
  const { event, context } = params
  const { recipientId, strategy, allocationKey, memberUnits, bps, totalWeight } = event.args
  const chainId = context.chain.id

  const blockNumber = event.block.number.toString()
  const blockTimestamp = Number(event.block.timestamp)
  const transactionHash = event.transaction.hash
  const allocator = event.transaction.from.toLowerCase()
  const contract = event.log.address.toLowerCase() as `0x${string}`

  const affectedRecipientIds = new Map<string, bigint>()
  affectedRecipientIds.set(recipientId.toString(), memberUnits)

  // Only the first event for a *brand new key* should add the key's weight to the flow.
  await updateAllocationWeightOnFlow(context.db, contract, allocationKey, totalWeight)

  const flow = await context.db.find(grants, { id: contract })
  if (!flow) throw new Error(`Flow not found: ${contract}`)

  // Clear previous-block votes at most once per (contract, key, block)
  const oldVotes = await clearOldVotesOncePerBlock(context.db, contract, allocationKey, blockNumber)

  for (const oldVote of oldVotes) {
    const existing = affectedRecipientIds.get(oldVote.recipientId) ?? BigInt(0)
    affectedRecipientIds.set(oldVote.recipientId, existing - BigInt(oldVote.memberUnits))
  }

  const voteId = `${contract}_${recipientId}_${allocator}_${blockNumber}_${strategy}_${allocationKey}`

  // Create the new vote
  await context.db.insert(allocations).values({
    id: voteId,
    chainId,
    contract,
    recipientId: recipientId.toString(),
    allocationKey: allocationKey.toString(),
    strategy: strategy.toLowerCase(),
    bps: Number(bps),
    allocator,
    blockNumber,
    blockTimestamp,
    transactionHash,
    memberUnits: memberUnits.toString(),
    totalWeight: totalWeight,
  })

  await context.db
    .insert(allocationsByAllocationKeyAndContract)
    .values({
      contractAllocationKey: `${contract}_${allocationKey}`,
      allocationIds: [voteId],
    })
    .onConflictDoUpdate((row) => ({
      allocationIds: Array.from(new Set([...row.allocationIds, voteId])),
    }))

  // Apply unit deltas
  for (const [rid, delta] of affectedRecipientIds) {
    const grantId = await getGrantIdFromFlowContractAndRecipientId(context.db, contract, rid)
    await context.db.update(grants, { id: grantId }).set((row) => ({
      memberUnits: (BigInt(row.memberUnits) + delta).toString(),
    }))
  }

  // 🔴 REMOVED: do not call handleIncomingFlowRates() here — it is called once on AllocationCommitted instead.
}

async function updateAllocationWeightOnFlow(
  db: Context["db"],
  contract: `0x${string}`,
  allocationKey: bigint,
  totalWeight: bigint
) {
  const grantId = contract
  if (grantId) {
    const existingVoteIds = await db.find(allocationsByAllocationKeyAndContract, {
      contractAllocationKey: `${contract}_${allocationKey}`,
    })
    if (!existingVoteIds || existingVoteIds.allocationIds.length === 0) {
      await db.update(grants, { id: grantId }).set((row) => ({
        totalAllocationWeightOnFlow: (
          BigInt(row.totalAllocationWeightOnFlow) + totalWeight
        ).toString(),
      }))
    }
  }
}

async function clearOldVotesOncePerBlock(
  db: Context["db"],
  contract: `0x${string}`,
  allocationKey: bigint,
  blockNumber: string
): Promise<Array<NonNullable<Awaited<ReturnType<typeof db.find<typeof allocations>>>>>> {
  const key = `${contract}_${allocationKey}`
  const already = await db.find(allocLastBlockByKey, { contractAllocationKey: key })

  if (already?.lastBlockNumber === blockNumber) {
    // We've already cleared stale rows for this (contract,key) in this block.
    return []
  }

  const existingVoteIds = await db.find(allocationsByAllocationKeyAndContract, {
    contractAllocationKey: key,
  })

  if (!existingVoteIds) {
    // Nothing to clear, just stamp the block
    await db
      .insert(allocLastBlockByKey)
      .values({ contractAllocationKey: key, lastBlockNumber: blockNumber })
      .onConflictDoUpdate(() => ({ lastBlockNumber: blockNumber }))
    return []
  }

  const existingVotesRaw = await Promise.all(
    existingVoteIds.allocationIds.map((allocationId) => db.find(allocations, { id: allocationId }))
  )

  // Filter out nulls/undefined
  const existingVotes = existingVotesRaw.filter(Boolean) as NonNullable<
    (typeof existingVotesRaw)[number]
  >[]

  // Include votes that come before the current block number
  const oldVotes = existingVotes.filter((v) => v.blockNumber !== blockNumber)

  if (oldVotes.length) {
    // Delete all stale votes (from previous blocks)
    await Promise.all(oldVotes.map((v) => db.delete(allocations, { id: v.id })))

    // Remove their ids from the KV list
    await db
      .update(allocationsByAllocationKeyAndContract, { contractAllocationKey: key })
      .set((row) => ({
        allocationIds: row.allocationIds.filter((id) => !oldVotes.some((ov) => ov.id === id)),
      }))
  }

  // Stamp the last cleared block
  await db
    .insert(allocLastBlockByKey)
    .values({ contractAllocationKey: key, lastBlockNumber: blockNumber })
    .onConflictDoUpdate(() => ({ lastBlockNumber: blockNumber }))

  return oldVotes
}
