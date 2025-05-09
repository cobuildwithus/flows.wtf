import { ponder, type Context, type Event } from "ponder:registry"
import { grants } from "ponder:schema"
import { addGrantEmbedding } from "../../embeddings/embed-grants"
import { isBlockRecent } from "../../../utils"
import { handleRecipientMappings } from "../mappings/eoa-mappings"
import { getParentFlow } from "../helpers"

ponder.on("NounsFlowChildren:RecipientCreated", handleRecipientCreated)
ponder.on("NounsFlow:RecipientCreated", handleRecipientCreated)

async function handleRecipientCreated(params: {
  event: Event<"NounsFlow:RecipientCreated">
  context: Context<"NounsFlow:RecipientCreated">
}) {
  const { event, context } = params
  const {
    recipient: { recipient: rawRecipient, metadata, recipientType },
    recipientId,
  } = event.args
  const recipient = rawRecipient.toLowerCase()

  const flowAddress = event.log.address.toLowerCase()
  const isRecent = isBlockRecent(Number(event.block.timestamp))

  const parentFlow = await getParentFlow(context.db, flowAddress)

  let grant = await context.db.find(grants, { id: flowAddress })

  if (!grant) {
    grant = await context.db.update(grants, { id: recipientId.toString() }).set({
      ...metadata,
      recipient,
      updatedAt: Number(event.block.timestamp),
      activatedAt: Number(event.block.timestamp),
      isActive: true,
      recipientId: recipientId.toString(),
    })
  }

  await Promise.all([
    handleRecipientMappings(context.db, recipient, flowAddress, grant.id),
    isRecent ? addGrantEmbedding(grant, recipientType, parentFlow.id) : Promise.resolve(),
  ])
}
