import { ponder, type Context, type Event } from "ponder:registry"
import { grants } from "ponder:schema"

ponder.on("SelfManagedFlow:ManagerUpdated", handleManagerUpdated)
ponder.on("CustomFlow:ManagerUpdated", handleManagerUpdated)
ponder.on("NounsFlow:ManagerUpdated", handleManagerUpdated)
ponder.on("NounsFlowChildren:ManagerUpdated", handleManagerUpdated)

async function handleManagerUpdated(params: {
  event: Event<"SelfManagedFlow:ManagerUpdated">
  context: Context<"SelfManagedFlow:ManagerUpdated">
}) {
  const { event, context } = params
  const { newManager } = event.args

  const grantId = event.log.address.toLowerCase()

  const grant = await context.db.find(grants, { id: grantId })

  if (!grant) {
    return
  }

  await context.db.update(grants, { id: grantId }).set({
    manager: newManager.toLowerCase(),
  })
}
