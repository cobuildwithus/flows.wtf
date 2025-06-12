import { ponder, type Context, type Event } from "ponder:registry"
import { allocationStrategies } from "ponder:schema"

ponder.on("CustomFlow:AllocationStrategyRegistered", handleAllocationStrategyRegistered)

async function handleAllocationStrategyRegistered(params: {
  event: Event<"CustomFlow:AllocationStrategyRegistered">
  context: Context<"CustomFlow:AllocationStrategyRegistered">
}) {
  const { context, event } = params

  const { strategy, strategyKey } = event.args

  const existingStrategy = await context.db.find(allocationStrategies, {
    address: strategy.toLowerCase(),
    chainId: context.chain.id,
  })

  // every flow is initialized with its own set of strategies
  // child flows sometimes have the same strategy contract as their parent
  // in this case we do not need to index the strategy again
  if (existingStrategy) return

  await context.db.insert(allocationStrategies).values({
    address: strategy.toLowerCase(),
    strategyKey,
    registeredAt: Number(event.block.timestamp),
    chainId: context.chain.id,
  })
}
