import { ponder, type Context, type Event } from "ponder:registry"
import { addGrantEmbedding } from "../../embeddings/embed-grants"
import { isBlockRecent } from "../../../utils"
import { getParentFlow } from "../helpers"
import { handleRecipientMappings } from "../mappings/eoa-mappings"
import { insertGrant } from "./insert-vrbs-grant"
import { grants } from "ponder:schema"
import { RecipientType } from "../../../enums"

ponder.on("VrbsFlow:RecipientCreated", handleRecipientCreated)
ponder.on("VrbsFlowChildren:RecipientCreated", handleRecipientCreated)

async function handleRecipientCreated(params: {
  event: Event<"VrbsFlow:RecipientCreated">
  context: Context<"VrbsFlow:RecipientCreated">
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

  const parentFlow = await getParentFlow(context.db, flowAddress)

  const grant = await insertGrant(context.db, {
    id: grantId,
    ...metadata,
    recipient,
    flowId: parentFlow.id,
    isFlow: false,
    submitter: approvedBy.toLowerCase(),
    parentContract: flowAddress,
    createdAt: timestamp,
    updatedAt: timestamp,
    isOnchainStartup: isOnchainStartup(flowAddress),
    recipientId: grantId,
  })
  await handleRecipientMappings(context.db, recipient, flowAddress, grant.id)

  if (isBlockRecent(timestamp)) {
    await addGrantEmbedding(grant, recipientType, parentFlow.id)
  }
}

function isOnchainStartup(flowContract: string) {
  const acceleratorFlows = ["0x3c6d95bc94dca34ba46365ee99d3469dc5cdbe61"]

  return acceleratorFlows.includes(flowContract)
}
