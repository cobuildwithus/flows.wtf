import { ponder, type Context, type Event } from "ponder:registry"
import { handleIncomingFlowRates } from "./lib/handle-incoming-flow-rates"
import { allocations, grants, allocationsByAllocationKeyAndContract } from "ponder:schema"
import { getGrantIdFromFlowContractAndRecipientId } from "./grant-helpers"

ponder.on("CustomFlow:AllocationSet", handleAllocationSet)

async function handleAllocationSet(params: {
  event: Event<"CustomFlow:AllocationSet">
  context: Context<"CustomFlow:AllocationSet">
}) {
  const { event, context } = params
  const { recipientId, strategy, allocationKey, bps, totalWeight } = event.args
  const chainId = context.chain.id

  const blockNumber = event.block.number.toString()
  const blockTimestamp = Number(event.block.timestamp)
  const transactionHash = event.transaction.hash
  const allocator = event.transaction.from.toLowerCase()
  const contract = event.log.address.toLowerCase() as `0x${string}`
  const allocationsCount = bps / (totalWeight / BigInt(1e18))

  const affectedRecipientIds = new Map<string, bigint>()
  affectedRecipientIds.set(recipientId.toString(), allocationsCount)

  let hasPreviousVotes = false

  await updateAllocationWeightOnFlow(context.db, contract, allocationKey, totalWeight)
  const flow = await context.db.find(grants, { id: contract })
  if (!flow) throw new Error(`Flow not found: ${contract}`)

  // Mark old votes for this token as stale
  const oldVotes = await getOldVotes(context.db, contract, allocationKey, blockNumber)

  for (const oldVote of oldVotes) {
    const existingVotes = affectedRecipientIds.get(oldVote.recipientId) ?? BigInt(0)
    affectedRecipientIds.set(oldVote.recipientId, existingVotes - BigInt(oldVote.allocationsCount))
    hasPreviousVotes = true
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
    allocationsCount: allocationsCount.toString(),
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

  // if is a new voter, then we are adding new member units to the total
  // so must handle all sibling flow rates
  if (!hasPreviousVotes) {
    await handleIncomingFlowRates(context.db, contract)
  }
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

async function getOldVotes(
  db: Context["db"],
  contract: `0x${string}`,
  allocationKey: bigint,
  blockNumber: string
) {
  const existingVoteIds = await db.find(allocationsByAllocationKeyAndContract, {
    contractAllocationKey: `${contract}_${allocationKey}`,
  })

  if (!existingVoteIds) return []

  const existingVotesRaw = await Promise.all(
    existingVoteIds.allocationIds.map((allocationId) => db.find(allocations, { id: allocationId }))
  )

  // filter out nulls
  const existingVotesNotNull = existingVotesRaw.filter(
    (vote) => vote !== undefined && vote !== null
  )

  // include votes that come before the latest vote block number
  // since all votescast events happen in the same block per vote
  const oldVotes = existingVotesNotNull.filter((vote) => vote.blockNumber !== blockNumber)

  // delete all old votes
  await Promise.all(oldVotes.map((vote) => db.delete(allocations, { id: vote.id })))

  await db
    .update(allocationsByAllocationKeyAndContract, {
      contractAllocationKey: `${contract}_${allocationKey}`,
    })
    .set((row) => ({
      allocationIds: row.allocationIds.filter(
        (allocationId) => !oldVotes.some((oldVote) => oldVote.id === allocationId)
      ),
    }))

  return oldVotes
}
