import { ponder, type Context, type Event } from "ponder:registry"
import { addGrantEmbedding } from "../../embeddings/embed-grants"
import { isBlockRecent } from "../../../utils"
import { getParentFlow } from "../helpers"
import { handleRecipientMappings } from "../mappings/eoa-mappings"
import { insertGrant } from "./insert-vrbs-grant"
import { grants } from "ponder:schema"

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

  const parentFlow = await getParentFlow(context.db, flowAddress)

  let existing = await context.db.find(grants, { id: flowAddress })

  if (!existing) {
    // this is an EOA recipient, so we need to insert a new grant
    existing = await insertGrant(context.db, {
      id: grantId,
      title: metadata.title,
      description: metadata.description,
      image: metadata.image,
      tagline: metadata.tagline,
      url: metadata.url,
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
  }

  await Promise.all([
    handleRecipientMappings(context.db, recipient, flowAddress, existing.id),
    isBlockRecent(timestamp)
      ? addGrantEmbedding(existing, recipientType, parentFlow.id)
      : Promise.resolve(),
  ])
}

function isOnchainStartup(flowContract: string) {
  const acceleratorFlows = ["0x3c6d95bc94dca34ba46365ee99d3469dc5cdbe61"]

  return acceleratorFlows.includes(flowContract)
}
