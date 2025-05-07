import { ponder, type Context, type Event } from "ponder:registry"
import { createFlowMappings } from "../mappings/flow-mappings"
import { addGrantEmbedding } from "../../embeddings/embed-grants"
import { isBlockRecent } from "../../../utils"
import { getParentFlow } from "../helpers"
import { handleRecipientMappings } from "../mappings/eoa-mappings"
import { insertGrant } from "./insert-vrbs-grant"
import { grants } from "ponder:schema"

ponder.on("VrbsFlow:FlowRecipientCreated", handleFlowRecipientCreated)
ponder.on("VrbsFlowChildren:FlowRecipientCreated", handleFlowRecipientCreated)

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

  let existingGrant = await context.db.find(grants, { id: grantId })

  if (existingGrant) {
    // this is recipient is a flow, so only update the metadata
    await context.db.update(grants, { id: grantId }).set({
      ...metadata,
      updatedAt: timestamp,
    })
  } else {
    existingGrant = await insertGrant(context.db, {
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
    })
  }

  await Promise.all([
    handleRecipientMappings(context.db, recipient, flowAddress, existingGrant.id),
    isBlockRecent(timestamp)
      ? addGrantEmbedding(existingGrant, recipientType, parentFlow.id)
      : Promise.resolve(),
  ])
}

function isOnchainStartup(flowContract: string) {
  const acceleratorFlows = ["0x3c6d95bc94dca34ba46365ee99d3469dc5cdbe61"]

  return acceleratorFlows.includes(flowContract)
}

async function handleFlowRecipientCreated(params: {
  event: Event<"VrbsFlow:FlowRecipientCreated">
  context: Context<"VrbsFlow:FlowRecipientCreated">
}) {
  const { event, context } = params
  const timestamp = Number(event.block.timestamp)
  const {
    recipient,
    recipientId,
    baselinePool,
    bonusPool,
    managerRewardPoolFlowRatePercent,
    baselinePoolFlowRatePercent,
  } = event.args

  const contract = event.log.address.toLowerCase() as `0x${string}`
  const submitter = event.transaction.from.toLowerCase() as `0x${string}`
  const flowRecipient = recipient.toLowerCase() as `0x${string}`
  const grantId = recipientId.toString()

  const parentFlow = await getParentFlow(context.db, contract)

  await insertGrant(context.db, {
    // temporarily set since metadata is emitted above and set
    title: "",
    description: "",
    image: "",
    tagline: "",
    url: "",
    id: grantId,
    isFlow: true,
    recipient: flowRecipient,
    flowId: parentFlow.id,
    submitter,
    parentContract: contract,
    baselinePool: baselinePool.toLowerCase(),
    bonusPool: bonusPool.toLowerCase(),
    managerRewardPoolFlowRatePercent,
    baselinePoolFlowRatePercent,
    createdAt: timestamp,
    updatedAt: timestamp,
  })

  await createFlowMappings(context.db, flowRecipient, grantId, bonusPool, baselinePool)
}
