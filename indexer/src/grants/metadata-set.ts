import { ponder, type Context, type Event } from "ponder:registry"
import { grants } from "ponder:schema"

ponder.on("NounsFlow:MetadataSet", handleMetadataSet)
ponder.on("NounsFlowChildren:MetadataSet", handleMetadataSet)
ponder.on("CustomFlow:MetadataSet", handleMetadataSet)

async function handleMetadataSet(params: {
  event: Event<"NounsFlow:MetadataSet">
  context: Context<"NounsFlow:MetadataSet">
}) {
  const { event, context } = params
  const { metadata } = event.args
  const id = event.log.address.toLowerCase()

  await context.db.update(grants, { id }).set({
    ...metadata,
    updatedAt: Number(event.block.timestamp),
  })
}
