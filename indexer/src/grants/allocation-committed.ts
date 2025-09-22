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

  // Diff against the previous committed set for this (contract,key,allocator)
  const lastKey = `${contract}_${allocationKey}_${allocator}`
  const prev = await context.db.find(lastRecipientsByKeyAllocator, {
    contractKeyAllocator: lastKey,
  })
  const prevRecipients = new Set(prev?.recipientIds ?? [])

  // Calculate recipients to delete = prev \ new
  const toDelete = [...prevRecipients].filter((id) => !newRecipients.includes(id))

  // Calculate unit deltas for both new and removed recipients
  const deltas = new Map<string, bigint>()

  // First, collect positive deltas from new allocations
  for (const recipientId of newRecipients) {
    const allocation = await context.db.find(allocations, {
      contract,
      allocationKey: allocationKey.toString(),
      allocator,
      recipientId,
    })
    if (allocation) {
      deltas.set(recipientId, BigInt(allocation.memberUnits))
    }
  }

  // Then subtract units for removed recipients
  for (const recipientId of toDelete) {
    // Get the allocation that's about to be deleted to know how many units to subtract
    const allocation = await context.db.find(allocations, {
      contract,
      allocationKey: allocationKey.toString(),
      allocator,
      recipientId,
    })
    if (allocation) {
      const existing = deltas.get(recipientId) ?? BigInt(0)
      deltas.set(recipientId, existing - BigInt(allocation.memberUnits))
    }

    // Delete the allocation row for this removed recipient
    await context.db.delete(allocations, {
      contract,
      allocationKey: allocationKey.toString(),
      allocator,
      recipientId,
    })
  }

  // Apply the unit deltas to grant rows
  for (const [rid, delta] of deltas) {
    if (delta !== BigInt(0)) {
      const grantId = await getGrantIdFromFlowContractAndRecipientId(context.db, contract, rid)
      if (grantId) {
        await context.db.update(grants, { id: grantId }).set((row) => ({
          memberUnits: (BigInt(row.memberUnits) + delta).toString(),
        }))
      }
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
