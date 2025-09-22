import { ponder, type Context, type Event } from "ponder:registry"
import {
  allocations,
  tempRecipientsByKeyAllocatorTx,
  lastRecipientsByKeyAllocator,
  grants,
} from "ponder:schema"
import { handleIncomingFlowRates } from "./lib/handle-incoming-flow-rates"
import { getGrantIdFromFlowContractAndRecipientId } from "./grant-helpers"

ponder.on("CustomFlow:AllocationCommitted", handleAllocationCommitted)

async function handleAllocationCommitted({
  event,
  context,
}: {
  event: Event<"CustomFlow:AllocationCommitted">
  context: Context<"CustomFlow:AllocationCommitted">
}) {
  const { allocationKey } = event.args
  const contract = event.log.address.toLowerCase() as `0x${string}`
  const blockNumber = event.block.number.toString()
  const txHash = event.transaction.hash
  const allocator = event.transaction.from.toLowerCase()

  // Pull the scratch list for this tx (the "new" recipient set)
  const scratchKey = `${contract}_${allocationKey}_${allocator}_${txHash}`
  const scratch = await context.db.find(tempRecipientsByKeyAllocatorTx, {
    contractKeyAllocatorTx: scratchKey,
  })
  const newRecipients = scratch?.recipientIds ?? []

  // Get the previous committed set for this (contract,key,allocator)
  const lastKey = `${contract}_${allocationKey}_${allocator}`
  const prev = await context.db.find(lastRecipientsByKeyAllocator, {
    contractKeyAllocator: lastKey,
  })
  const prevRecipientIds = prev?.recipientIds ?? []

  // Build a map of previous memberUnits for delta calculation
  const previousMemberUnits = new Map<string, bigint>()
  for (const recipientId of prevRecipientIds) {
    const prevAllocation = await context.db.find(allocations, {
      contract,
      allocationKey: allocationKey.toString(),
      allocator,
      recipientId,
    })
    if (prevAllocation && prevAllocation.commitTxHash !== txHash) {
      // Only count it as "previous" if it's from a different commit
      previousMemberUnits.set(recipientId, BigInt(prevAllocation.memberUnits))
    }
  }

  // Calculate current memberUnits and update commitTxHash for all new recipients
  const currentMemberUnits = new Map<string, bigint>()
  for (const recipientId of newRecipients) {
    const allocation = await context.db.find(allocations, {
      contract,
      allocationKey: allocationKey.toString(),
      allocator,
      recipientId,
    })
    if (allocation) {
      currentMemberUnits.set(recipientId, BigInt(allocation.memberUnits))
      // Update the commitTxHash to mark this allocation as committed
      await context.db
        .update(allocations, {
          contract,
          allocationKey: allocationKey.toString(),
          allocator,
          recipientId,
        })
        .set(() => ({
          commitTxHash: txHash,
        }))
    }
  }

  // Calculate deltas for all affected recipients
  const deltas = new Map<string, bigint>()

  // Process all recipients (both old and new)
  const allRecipients = new Set([...previousMemberUnits.keys(), ...currentMemberUnits.keys()])

  for (const recipientId of allRecipients) {
    const oldUnits = previousMemberUnits.get(recipientId) ?? BigInt(0)
    const newUnits = currentMemberUnits.get(recipientId) ?? BigInt(0)
    const delta = newUnits - oldUnits

    if (delta !== BigInt(0)) {
      deltas.set(recipientId, delta)
    }

    // Delete allocation for removed recipients
    if (oldUnits > BigInt(0) && newUnits === BigInt(0)) {
      await context.db.delete(allocations, {
        contract,
        allocationKey: allocationKey.toString(),
        allocator,
        recipientId,
      })
    }
  }

  // Apply the unit deltas to grant rows
  for (const [rid, delta] of deltas) {
    const grantId = await getGrantIdFromFlowContractAndRecipientId(context.db, contract, rid)
    if (grantId) {
      await context.db.update(grants, { id: grantId }).set((row) => ({
        memberUnits: (BigInt(row.memberUnits) + delta).toString(),
      }))
    }
  }

  // Save the "last" recipients set for this allocator/key
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

  // Clean up the scratch row for this tx
  await context.db.delete(tempRecipientsByKeyAllocatorTx, { contractKeyAllocatorTx: scratchKey })

  // Recompute flows exactly once
  await handleIncomingFlowRates(context.db, contract)
}
