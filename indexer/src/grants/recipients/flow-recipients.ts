import { ponder, type Context, type Event } from "ponder:registry"
import { grants } from "ponder:schema"
import { createFlowMappings } from "./mappings/flow-mappings"

ponder.on("NounsFlowChildren:FlowRecipientCreated", handleFlowRecipientCreated)
ponder.on("NounsFlow:FlowRecipientCreated", handleFlowRecipientCreated)

async function handleFlowRecipientCreated(params: {
  event: Event<"NounsFlow:FlowRecipientCreated">
  context: Context<"NounsFlow:FlowRecipientCreated">
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

  const parentContract = event.log.address.toLowerCase()
  const flowContract = recipient.toLowerCase()
  const grantId = recipientId.toString()

  await context.db.update(grants, { id: grantId }).set({
    baselinePool: baselinePool.toLowerCase(),
    bonusPool: bonusPool.toLowerCase(),
    managerRewardPoolFlowRatePercent,
    baselinePoolFlowRatePercent,
    recipient: flowContract,
    updatedAt: Number(event.block.timestamp),
    parentContract: parentContract,
    isActive: true,
  })

  // don't update recipient counts here because it's already done in the recipient created event
  // eg: the recipient created event is emitted when a flow recipient is created anyway
  await createFlowMappings(context.db, flowContract, grantId, bonusPool, baselinePool)
}
