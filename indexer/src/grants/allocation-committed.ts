import { ponder, type Context, type Event } from "ponder:registry"
import {
  allocations,
  tempRecipientsByKeyAllocatorTx,
  lastRecipientsByKeyAllocator,
  grants,
  allocationKeyRegistered,
} from "ponder:schema"
import { handleIncomingFlowRates } from "./lib/handle-incoming-flow-rates"

ponder.on("CustomFlow:AllocationCommitted", handleAllocationCommitted)

async function handleAllocationCommitted({
  event,
  context,
}: {
  event: Event<"CustomFlow:AllocationCommitted">
  context: Context<"CustomFlow:AllocationCommitted">
}) {
  const { allocationKey, strategy, weight } = event.args
  const chainId = context.chain.id
  const contract = event.log.address.toLowerCase() as `0x${string}`
  const blockNumber = event.block.number.toString()
  const txHash = event.transaction.hash
  const allocator = event.transaction.from.toLowerCase()
  const strategyLower = (strategy as string).toLowerCase()

  // First-use weight (once per (strategy,key))
  await incrementWeightIfFirstUse(
    context.db,
    chainId,
    contract,
    strategyLower,
    allocationKey,
    weight,
    blockNumber
  )

  // Pull the scratch list for this tx (the "new" recipient set)
  const scratchKey = `${chainId}_${contract}_${strategyLower}_${allocationKey}_${allocator}_${txHash}`
  const scratch = await context.db.find(tempRecipientsByKeyAllocatorTx, {
    contractKeyAllocatorTx: scratchKey,
  })
  const newRecipients = scratch?.recipientIds ?? []

  // Safety: the contract can't commit an empty set; skip rather than wiping state if scratch is missing.
  if (newRecipients.length === 0) return

  // Get the previous committed set for this (chain,contract,strategy,key,allocator)
  const lastKey = `${chainId}_${contract}_${strategyLower}_${allocationKey}_${allocator}`
  const prev = await context.db.find(lastRecipientsByKeyAllocator, {
    contractKeyAllocator: lastKey,
  })
  const prevRecipientIds = prev?.recipientIds ?? []

  // Build a map of previous committed units (per strategy) in parallel
  const previousMemberUnits = new Map<string, bigint>()
  const prevAllocs = await Promise.all(
    prevRecipientIds.map((recipientId) =>
      context.db.find(allocations, {
        contract,
        allocationKey: allocationKey.toString(),
        strategy: strategyLower,
        allocator,
        recipientId,
        chainId,
      } as any)
    )
  )
  prevRecipientIds.forEach((recipientId, idx) => {
    const prevAllocation = prevAllocs[idx]
    if (prevAllocation) {
      previousMemberUnits.set(recipientId, BigInt(prevAllocation.committedMemberUnits))
    } else {
      previousMemberUnits.set(recipientId, 0n)
    }
  })

  // Current units come from upserted AllocationSet rows in this tx (per strategy) in parallel
  const currentMemberUnits = new Map<string, bigint>()
  const curAllocs = await Promise.all(
    newRecipients.map((recipientId) =>
      context.db.find(allocations, {
        contract,
        allocationKey: allocationKey.toString(),
        strategy: strategyLower,
        allocator,
        recipientId,
        chainId,
      } as any)
    )
  )
  newRecipients.forEach((recipientId, idx) => {
    const allocation = curAllocs[idx]
    if (allocation) {
      currentMemberUnits.set(recipientId, BigInt(allocation.memberUnits))
    }
  })

  // Track removals only; member units are updated via pool events
  const allRecipients = new Set([...previousMemberUnits.keys(), ...currentMemberUnits.keys()])

  for (const recipientId of allRecipients) {
    const oldUnits = previousMemberUnits.get(recipientId) ?? 0n
    const newUnits = currentMemberUnits.get(recipientId) ?? 0n

    // Delete allocation for removed recipients (this strategy only)
    if (oldUnits > 0n && newUnits === 0n) {
      await context.db.delete(allocations, {
        contract,
        allocationKey: allocationKey.toString(),
        strategy: strategyLower,
        allocator,
        recipientId,
        chainId,
      })
    }
  }

  // No grant memberUnits mutations here; units come from Superfluid pool events

  // Stamp committed snapshot and commitTxHash for all new recipients (this strategy only)
  await Promise.all(
    newRecipients.map((rid) =>
      context.db
        .update(allocations, {
          contract,
          allocationKey: allocationKey.toString(),
          strategy: strategyLower,
          allocator,
          recipientId: rid,
          chainId,
        } as any)
        .set((row) => ({
          committedMemberUnits: row.memberUnits,
          commitTxHash: txHash,
        }))
    )
  )

  // Save the "last" recipients set for this allocator/key/strategy
  await context.db
    .insert(lastRecipientsByKeyAllocator)
    .values({
      contractKeyAllocator: lastKey,
      recipientIds: newRecipients,
      lastCommitTxHash: txHash,
      lastBlockNumber: blockNumber,
    })
    .onConflictDoUpdate(() => ({
      recipientIds: newRecipients,
      lastCommitTxHash: txHash,
      lastBlockNumber: blockNumber,
    }))

  // Clean up the scratch row for this tx (strategy-scoped)
  await context.db.delete(tempRecipientsByKeyAllocatorTx, { contractKeyAllocatorTx: scratchKey })

  // Recompute flows exactly once
  await handleIncomingFlowRates(context.db, contract)
}

async function incrementWeightIfFirstUse(
  db: Context["db"],
  chainId: number,
  contract: `0x${string}`,
  strategyLower: string,
  allocationKey: bigint,
  newWeight: bigint,
  blockNumber: string
) {
  const key = `${chainId}_${contract}_${strategyLower}_${allocationKey}`
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
