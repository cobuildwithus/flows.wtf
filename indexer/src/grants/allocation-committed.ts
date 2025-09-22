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
  const chainId = context.chain.id
  const contract = event.log.address.toLowerCase() as `0x${string}`
  const blockNumber = event.block.number.toString()
  const txHash = event.transaction.hash
  const allocator = event.transaction.from.toLowerCase()

  // Pull the scratch list for this tx (the "new" recipient set)
  const scratchKey = `${chainId}_${contract}_${allocationKey}_${allocator}_${txHash}`
  const scratch = await context.db.find(tempRecipientsByKeyAllocatorTx, {
    contractKeyAllocatorTx: scratchKey,
  })
  const newRecipients = scratch?.recipientIds ?? []

  // Get the previous committed set for this (chain,contract,key,allocator)
  const lastKey = `${chainId}_${contract}_${allocationKey}_${allocator}`
  const prev = await context.db.find(lastRecipientsByKeyAllocator, {
    contractKeyAllocator: lastKey,
  })
  const prevRecipientIds = prev?.recipientIds ?? []

  // Build a map of previous committed units
  const previousMemberUnits = new Map<string, bigint>()
  for (const recipientId of prevRecipientIds) {
    const prevAllocation = await context.db.find(allocations, {
      contract,
      allocationKey: allocationKey.toString(),
      allocator,
      recipientId,
      chainId,
    })
    if (prevAllocation) {
      previousMemberUnits.set(recipientId, BigInt(prevAllocation.committedMemberUnits))
    } else {
      previousMemberUnits.set(recipientId, 0n)
    }
  }

  // Current units come from upserted AllocationSet rows in this tx
  const currentMemberUnits = new Map<string, bigint>()
  for (const recipientId of newRecipients) {
    const allocation = await context.db.find(allocations, {
      contract,
      allocationKey: allocationKey.toString(),
      allocator,
      recipientId,
      chainId,
    })
    if (allocation) {
      currentMemberUnits.set(recipientId, BigInt(allocation.memberUnits))
    }
  }

  // Calculate deltas across union of recipients
  const deltas = new Map<string, bigint>()
  const allRecipients = new Set([...previousMemberUnits.keys(), ...currentMemberUnits.keys()])

  for (const recipientId of allRecipients) {
    const oldUnits = previousMemberUnits.get(recipientId) ?? 0n
    const newUnits = currentMemberUnits.get(recipientId) ?? 0n
    const delta = newUnits - oldUnits
    if (delta !== 0n) deltas.set(recipientId, delta)

    // Delete allocation for removed recipients
    if (oldUnits > 0n && newUnits === 0n) {
      await context.db.delete(allocations, {
        contract,
        allocationKey: allocationKey.toString(),
        allocator,
        recipientId,
        chainId,
      })
    }
  }

  // Apply the unit deltas to grant rows with defensive clamping and error handling
  for (const [rid, delta] of deltas) {
    try {
      if (delta !== 0n) {
        const grantId = await getGrantIdFromFlowContractAndRecipientId(context.db, contract, rid)
        await context.db.update(grants, { id: grantId }).set((row) => {
          const next = BigInt(row.memberUnits) + delta
          return { memberUnits: (next < 0n ? 0n : next).toString() }
        })
      }
    } catch (e: any) {
      console.error(e)
    }
  }

  // Stamp committed snapshot and commitTxHash for all new recipients
  for (const rid of newRecipients) {
    await context.db
      .update(allocations, {
        contract,
        allocationKey: allocationKey.toString(),
        allocator,
        recipientId: rid,
        chainId,
      })
      .set((row) => ({
        committedMemberUnits: row.memberUnits,
        commitTxHash: txHash,
      }))
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
