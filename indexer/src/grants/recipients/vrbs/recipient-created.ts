import { ponder, type Context, type Event } from "ponder:registry"
import { addGrantEmbedding } from "../../embeddings/embed-grants"
import { isBlockRecent } from "../../../utils"
import { getFlow, isOnchainStartup } from "../helpers"
import { handleRecipientMappings } from "../mappings/eoa-mappings"
import { insertGrant } from "./insert-vrbs-grant"
import { RecipientType } from "../../../enums"
import { addGrantIdToFlowContractAndRecipientId } from "../../grant-helpers"

ponder.on("CustomFlow:RecipientCreated", handleRecipientCreated)

async function handleRecipientCreated(params: {
  event: Event<"CustomFlow:RecipientCreated">
  context: Context<"CustomFlow:RecipientCreated">
}) {
  const { event, context } = params
  const {
    recipient: { recipient: rawRecipient, metadata, recipientType },
    recipientId,
    approvedBy,
  } = event.args

  const recipient = rawRecipient.toLowerCase()
  const flowAddress = event.log.address.toLowerCase()
  const grantId = recipientId.toString()
  const timestamp = Number(event.block.timestamp)

  if (recipientType === RecipientType.FlowContract) {
    return
  }

  const flow = await getFlow(context.db, flowAddress)

  const grant = await insertGrant(context.db, {
    id: grantId,
    ...metadata,
    recipient,
    flowId: flow.id,
    isFlow: false,
    submitter: approvedBy.toLowerCase(),
    parentContract: flowAddress,
    createdAt: timestamp,
    updatedAt: timestamp,
    isOnchainStartup: isOnchainStartup(flowAddress),
    recipientId: grantId,
  })
  await handleRecipientMappings(context.db, recipient, flowAddress, grant.id)
  await addGrantIdToFlowContractAndRecipientId(context.db, flowAddress, recipientId, grant.id)

  if (isBlockRecent(timestamp)) {
    await addGrantEmbedding(grant, recipientType, flow.id)
  }
}
