import { ponder, type Context, type Event } from "ponder:registry"
import { handleIncomingFlowRates } from "./lib/handle-incoming-flow-rates"

/**
 * Handler for the AllocationCommitted event which is emitted once at the end of
 * a batch allocation operation (after all AllocationSet events).
 *
 * Event signature: AllocationCommitted(address indexed strategy, uint256 indexed allocationKey, bytes32 commit, uint256 weight)
 *
 * This handler recomputes flow rates exactly once per allocation batch,
 * solving the O(N) performance issue where handleIncomingFlowRates was previously
 * called N times for N recipients in a single transaction.
 */

ponder.on("CustomFlow:AllocationCommitted", handleAllocationCommitted)

async function handleAllocationCommitted(params: {
  event: Event<"CustomFlow:AllocationCommitted">
  context: Context<"CustomFlow:AllocationCommitted">
}) {
  const { event, context } = params
  const contract = event.log.address.toLowerCase() as `0x${string}`

  // Recompute incoming flow rates once, after all AllocationSet events in this commit
  await handleIncomingFlowRates(context.db, contract)
}
