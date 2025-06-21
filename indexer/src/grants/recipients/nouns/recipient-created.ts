import { ponder, type Context, type Event } from "ponder:registry"
import { grants } from "ponder:schema"
import { addGrantEmbedding } from "../../embeddings/embed-grants"
import { isBlockRecent } from "../../../utils"
import { handleRecipientMappings } from "../mappings/eoa-mappings"
import { getFlow } from "../helpers"
import { RecipientType } from "../../../enums"
import { addGrantIdToFlowContractAndRecipientId } from "../../grant-helpers"

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

  if (recipientType === RecipientType.FlowContract) {
    return
  }

  const recipient = rawRecipient.toLowerCase()

  const flowAddress = event.log.address.toLowerCase()
  const timestamp = Number(event.block.timestamp)

  const parentFlow = await getFlow(context.db, flowAddress)

  const grant = await context.db.update(grants, { id: recipientId.toString() }).set({
    ...metadata,
    recipient,
    updatedAt: Number(event.block.timestamp),
    activatedAt: Number(event.block.timestamp),
    isActive: true,
    recipientId: recipientId.toString(),
  })

  await context.db.update(grants, { id: parentFlow.id }).set({
    activeRecipientCount: parentFlow.activeRecipientCount + 1,
  })

  await handleRecipientMappings(context.db, recipient, flowAddress, grant.id)
  await addGrantIdToFlowContractAndRecipientId(context.db, flowAddress, recipientId, grant.id)

  if (isBlockRecent(timestamp)) {
    await addGrantEmbedding(grant, recipientType, parentFlow.id)
  }
}
