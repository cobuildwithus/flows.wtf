import { ponder, type Context, type Event } from "ponder:registry"
import { flowContractToGrantId, grants } from "ponder:schema"

ponder.on("NounsFlow:MetadataSet", handleMetadataSet)
ponder.on("NounsFlowChildren:MetadataSet", handleMetadataSet)

async function handleMetadataSet(params: {
  event: Event<"NounsFlow:MetadataSet">
  context: Context<"NounsFlow:MetadataSet">
}) {
  const { event, context } = params
  const { metadata } = event.args
  const flow = event.log.address.toLowerCase()

  const grant = await context.db.find(flowContractToGrantId, { contract: flow })
  if (!grant) throw new Error("Flow not found")

  if (!grant) {
    console.error({ flow })
    throw new Error(`Grant not found: ${flow}`)
  }

  await context.db.update(grants, { id: grant.grantId }).set({
    ...metadata,
    updatedAt: Number(event.block.timestamp),
  })
}
