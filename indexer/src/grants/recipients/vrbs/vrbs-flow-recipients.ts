import { ponder, type Context, type Event } from "ponder:registry"
import { createFlowMappings } from "../mappings/flow-mappings"
import { getParentFlow } from "../helpers"
import { insertGrant } from "./insert-vrbs-grant"

ponder.on("VrbsFlow:FlowRecipientCreated", handleFlowRecipientCreated)
ponder.on("VrbsFlowChildren:FlowRecipientCreated", handleFlowRecipientCreated)

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
