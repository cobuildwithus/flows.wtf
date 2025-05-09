import { ponder, type Context, type Event } from "ponder:registry"
import { grants } from "ponder:schema"

ponder.on("AllocatorFlow:AllocatorChanged", handleAllocatorChanged)

async function handleAllocatorChanged(params: {
  event: Event<"AllocatorFlow:AllocatorChanged">
  context: Context<"AllocatorFlow:AllocatorChanged">
}) {
  const { event, context } = params
  const { newAllocator } = event.args

  const grantId = event.log.address.toLowerCase()

  if (!grantId) {
    return
  }

  await context.db.update(grants, { id: grantId }).set({
    allocator: newAllocator,
  })
}
