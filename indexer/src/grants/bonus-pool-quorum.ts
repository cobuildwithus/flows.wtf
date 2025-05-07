import { ponder, type Context, type Event } from "ponder:registry"
import { flowContractToGrantId, grants } from "ponder:schema"

ponder.on("NounsFlowChildren:BonusPoolQuorumUpdated", handleBonusPoolQuorumUpdated)
ponder.on("NounsFlow:BonusPoolQuorumUpdated", handleBonusPoolQuorumUpdated)
ponder.on("VrbsFlowChildren:BonusPoolQuorumUpdated", handleBonusPoolQuorumUpdated)
ponder.on("VrbsFlow:BonusPoolQuorumUpdated", handleBonusPoolQuorumUpdated)

async function handleBonusPoolQuorumUpdated(params: {
  event: Event<"NounsFlow:BonusPoolQuorumUpdated">
  context: Context<"NounsFlow:BonusPoolQuorumUpdated">
}) {
  const { event, context } = params

  const { newBonusPoolQuorum } = event.args

  const contract = event.log.address.toLowerCase() as `0x${string}`

  const grantId = await context.db.find(flowContractToGrantId, { contract })
  if (!grantId) throw new Error(`Grant not found: ${contract}`)

  await context.db.update(grants, { id: grantId.grantId }).set({
    bonusPoolQuorum: Number(newBonusPoolQuorum),
  })
}
