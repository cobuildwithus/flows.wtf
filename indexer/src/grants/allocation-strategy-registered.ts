import { ponder, type Context, type Event } from "ponder:registry"
import { allocationStrategies } from "ponder:schema"

ponder.on("CustomFlow:AllocationStrategyRegistered", handleAllocationStrategyRegistered)

async function handleAllocationStrategyRegistered(params: {
  event: Event<"CustomFlow:AllocationStrategyRegistered">
  context: Context<"CustomFlow:AllocationStrategyRegistered">
}) {
  const { context, event } = params

  const { strategy, strategyKey } = event.args

  await context.db.insert(allocationStrategies).values({
    address: strategy.toLowerCase(),
    strategyKey,
    registeredAt: Number(event.block.timestamp),
    chainId: context.chain.id,
  })
}
