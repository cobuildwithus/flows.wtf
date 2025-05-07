import { ponder, type Context, type Event } from "ponder:registry"
import { createFlowMappings } from "../mappings/flow-mappings"
import { addGrantEmbedding } from "../../embeddings/embed-grants"
import { isBlockRecent } from "../../../utils"
import { getParentFlow } from "../helpers"
import { handleRecipientMappings } from "../mappings/eoa-mappings"
import { insertGrant } from "./insert-vrbs-grant"

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

  const grant = await insertGrant(context.db, {
    id: grantId,
    metadata,
    recipient,
    flowId: grantId,
    submitter: approvedBy.toLowerCase(),
    parentContract: flowAddress,
    createdAt: timestamp,
    updatedAt: timestamp,
  })

  await Promise.all([
    handleRecipientMappings(context.db, recipient, flowAddress, grant.id),
    isBlockRecent(timestamp)
      ? addGrantEmbedding(grant, recipientType, parentFlow.id)
      : Promise.resolve(),
  ])
}

async function handleFlowRecipientCreated(params: {
  event: Event<"VrbsFlow:FlowRecipientCreated">
  context: Context<"VrbsFlow:FlowRecipientCreated">
}) {
  const { event, context } = params
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
  const flowContract = recipient.toLowerCase() as `0x${string}`
  const grantId = recipientId.toString()
  const timestamp = Number(event.block.timestamp)

  const { metadata } = await context.client.readContract({
    address: contract,
    abi: context.contracts.VrbsFlow.abi,
    functionName: "getRecipientById",
    args: [recipientId],
  })

  await insertGrant(context.db, {
    id: grantId,
    metadata,
    recipient: flowContract,
    flowId: grantId,
    submitter,
    parentContract: contract,
    baselinePool: baselinePool.toLowerCase(),
    bonusPool: bonusPool.toLowerCase(),
    managerRewardPoolFlowRatePercent,
    baselinePoolFlowRatePercent,
    createdAt: timestamp,
    updatedAt: timestamp,
  })

  await createFlowMappings(context.db, flowContract, grantId, bonusPool, baselinePool)
}
