import { ponder, type Context, type Event } from "ponder:registry"
import { flowContractToGrantId, grants } from "ponder:schema"

ponder.on("AllocatorFlow:AllocatorChanged", handleAllocatorChanged)

async function handleAllocatorChanged(params: {
  event: Event<"AllocatorFlow:AllocatorChanged">
  context: Context<"AllocatorFlow:AllocatorChanged">
}) {
  const { event, context } = params
  const { newAllocator } = event.args

  const flowAddress = event.log.address.toLowerCase()

  const flowGrantId = await context.db.find(flowContractToGrantId, { contract: flowAddress })

  if (!flowGrantId) {
    return
  }

  const grantId = flowGrantId.grantId

  if (!grantId) {
    return
  }

  await context.db.update(grants, { id: grantId }).set({
    allocator: newAllocator,
  })
}
