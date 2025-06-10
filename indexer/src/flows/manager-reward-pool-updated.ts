import { ponder, type Context, type Event } from "ponder:registry"
import { grants } from "ponder:schema"

ponder.on("CustomFlow:ManagerRewardPoolUpdated", handleManagerRewardPoolUpdated)
ponder.on("NounsFlow:ManagerRewardPoolUpdated", handleManagerRewardPoolUpdated)
ponder.on("NounsFlowChildren:ManagerRewardPoolUpdated", handleManagerRewardPoolUpdated)

async function handleManagerRewardPoolUpdated(params: {
  event: Event<"CustomFlow:ManagerRewardPoolUpdated">
  context: Context<"CustomFlow:ManagerRewardPoolUpdated">
}) {
  const { event, context } = params
  const { newManagerRewardPool } = event.args

  const grantId = event.log.address.toLowerCase()

  const grant = await context.db.find(grants, { id: grantId })

  if (!grant) {
    return
  }

  await context.db.update(grants, { id: grantId }).set({
    managerRewardPool: newManagerRewardPool.toLowerCase(),
  })
}
