import { ponder, type Context, type Event } from "ponder:registry"
import { grants } from "ponder:schema"

ponder.on("CustomFlow:BonusPoolQuorumUpdated", handleBonusPoolQuorumUpdated)

async function handleBonusPoolQuorumUpdated(params: {
  event: Event<"CustomFlow:BonusPoolQuorumUpdated">
  context: Context<"CustomFlow:BonusPoolQuorumUpdated">
}) {
  const { event, context } = params

  const { newBonusPoolQuorum } = event.args

  const grantId = event.log.address.toLowerCase() as `0x${string}`

  await context.db.update(grants, { id: grantId }).set({
    bonusPoolQuorum: Number(newBonusPoolQuorum),
  })
}
