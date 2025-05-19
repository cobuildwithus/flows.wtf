import { ponder, type Context, type Event } from "ponder:registry"
import { grants } from "ponder:schema"

ponder.on("NounsFlowChildren:BonusPoolQuorumUpdated", handleBonusPoolQuorumUpdated)
ponder.on("NounsFlow:BonusPoolQuorumUpdated", handleBonusPoolQuorumUpdated)
ponder.on("RevolutionFlowChildren:BonusPoolQuorumUpdated", handleBonusPoolQuorumUpdated)
ponder.on("RevolutionFlow:BonusPoolQuorumUpdated", handleBonusPoolQuorumUpdated)

async function handleBonusPoolQuorumUpdated(params: {
  event: Event<"NounsFlow:BonusPoolQuorumUpdated">
  context: Context<"NounsFlow:BonusPoolQuorumUpdated">
}) {
  const { event, context } = params

  const { newBonusPoolQuorum } = event.args

  const grantId = event.log.address.toLowerCase() as `0x${string}`

  await context.db.update(grants, { id: grantId }).set({
    bonusPoolQuorum: Number(newBonusPoolQuorum),
  })
}
