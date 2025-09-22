import { ponder, type Context, type Event } from "ponder:registry"
import {
  allocations,
  grants,
  tempRecipientsByKeyAllocatorTx,
  allocationKeyRegistered,
} from "ponder:schema"

ponder.on("CustomFlow:AllocationSet", handleAllocationSet)

async function handleAllocationSet({
  event,
  context,
}: {
  event: Event<"CustomFlow:AllocationSet">
  context: Context<"CustomFlow:AllocationSet">
}) {
  const { recipientId, strategy, allocationKey, memberUnits, bps, totalWeight } = event.args
  const chainId = context.chain.id

  const blockNumber = event.block.number.toString()
  const blockTimestamp = Number(event.block.timestamp)
  const transactionHash = event.transaction.hash
  const allocator = event.transaction.from.toLowerCase()
  const contract = event.log.address.toLowerCase() as `0x${string}`
  const logIndex = Number(event.log.logIndex)

  // Update weight-on-flow if this (contract,key) is brand new
  await incrementWeightIfFirstUse(
    context.db,
    chainId,
    contract,
    allocationKey,
    totalWeight,
    blockNumber
  )

  const flow = await context.db.find(grants, { id: contract })
  if (!flow) throw new Error(`Flow not found: ${contract}`)

  // Upsert the allocation row for (contract, key, allocator, recipientId)
  await context.db
    .insert(allocations)
    .values({
      contract,
      allocationKey: allocationKey.toString(),
      allocator,
      recipientId: recipientId.toString(),
      chainId,
      strategy: strategy.toLowerCase(),
      bps: Number(bps),
      memberUnits: memberUnits.toString(),
      committedMemberUnits: "0",
      totalWeight,
      blockNumber,
      blockTimestamp,
      transactionHash,
      logIndex,
      commitTxHash: "", // Will be set on AllocationCommitted
    })
    .onConflictDoUpdate((row) => ({
      // Overwrite with latest values in the same tx/block
      chainId,
      strategy: strategy.toLowerCase(),
      bps: Number(bps),
      memberUnits: memberUnits.toString(),
      totalWeight,
      blockNumber,
      blockTimestamp,
      transactionHash,
      logIndex,
      // Keep snapshot and commit fields until committed
      committedMemberUnits: row.committedMemberUnits,
      commitTxHash: row.commitTxHash,
    }))

  // Build the scratch recipient set for this tx
  const scratchKey = `${chainId}_${contract}_${allocationKey}_${allocator}_${transactionHash}`
  await context.db
    .insert(tempRecipientsByKeyAllocatorTx)
    .values({
      contractKeyAllocatorTx: scratchKey,
      recipientIds: [recipientId.toString()],
    })
    .onConflictDoUpdate((row) => ({
      recipientIds: Array.from(new Set([...row.recipientIds, recipientId.toString()])),
    }))
}

async function incrementWeightIfFirstUse(
  db: Context["db"],
  chainId: number,
  contract: `0x${string}`,
  allocationKey: bigint,
  newWeight: bigint,
  blockNumber: string
) {
  const key = `${chainId}_${contract}_${allocationKey}`
  const seen = await db.find(allocationKeyRegistered, { contractAllocationKey: key })
  if (!seen) {
    await db.update(grants, { id: contract }).set((row) => ({
      totalAllocationWeightOnFlow: (BigInt(row.totalAllocationWeightOnFlow) + newWeight).toString(),
    }))
    await db
      .insert(allocationKeyRegistered)
      .values({ contractAllocationKey: key, firstSeenBlock: blockNumber })
  }
}
