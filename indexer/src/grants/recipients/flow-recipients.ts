import { ponder, type Context, type Event } from "ponder:registry"
import {
  bonusPoolToGrantId,
  baselinePoolToGrantId,
  flowContractToGrantId,
  grants,
  parentFlowToChildren,
} from "ponder:schema"

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

  const flowContract = recipient.toLowerCase()
  const grantId = recipientId.toString()

  await context.db.update(grants, { id: grantId }).set({
    baselinePool: baselinePool.toLowerCase(),
    bonusPool: bonusPool.toLowerCase(),
    managerRewardPoolFlowRatePercent,
    baselinePoolFlowRatePercent,
    recipient: flowContract,
    updatedAt: Number(event.block.timestamp),
    isActive: true,
  })

  // don't update recipient counts here because it's already done in the recipient created event
  // eg: the recipient created event is emitted when a flow recipient is created anyway
  await createFlowMappings(context.db, flowContract, grantId, bonusPool, baselinePool)
}

async function createFlowMappings(
  db: Context["db"],
  flowContract: string,
  grantId: string,
  bonusPool: string,
  baselinePool: string
) {
  await Promise.all([
    db.insert(flowContractToGrantId).values({
      contract: flowContract,
      grantId,
    }),
    db.insert(bonusPoolToGrantId).values({
      bonusPool: bonusPool.toLowerCase(),
      grantId,
    }),
    db.insert(baselinePoolToGrantId).values({
      baselinePool: baselinePool.toLowerCase(),
      grantId,
    }),
    db.insert(parentFlowToChildren).values({
      parentFlowContract: flowContract,
      childGrantIds: [],
    }),
  ])
}
