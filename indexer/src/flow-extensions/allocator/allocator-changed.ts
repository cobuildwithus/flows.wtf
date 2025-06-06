import { ponder, type Context, type Event } from "ponder:registry"
import { grants } from "ponder:schema"

ponder.on("SelfManagedFlow:AllocatorChanged", handleAllocatorChanged)

async function handleAllocatorChanged(params: {
  event: Event<"SelfManagedFlow:AllocatorChanged">
  context: Context<"SelfManagedFlow:AllocatorChanged">
}) {
  const { event, context } = params
  const { newAllocator } = event.args

  const grantId = event.log.address.toLowerCase()

  const grant = await context.db.find(grants, { id: grantId })

  if (!grant) {
    return
  }

  await context.db.update(grants, { id: grantId }).set({
    allocator: newAllocator.toLowerCase(),
  })
}
