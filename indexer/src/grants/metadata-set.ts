import { ponder, type Context, type Event } from "ponder:registry"
import { grants } from "ponder:schema"

ponder.on("CustomFlow:MetadataSet", handleMetadataSet)

async function handleMetadataSet(params: {
  event: Event<"CustomFlow:MetadataSet">
  context: Context<"CustomFlow:MetadataSet">
}) {
  const { event, context } = params
  const { metadata } = event.args
  const id = event.log.address.toLowerCase()

  await context.db.update(grants, { id }).set({
    ...metadata,
    updatedAt: Number(event.block.timestamp),
  })
}
