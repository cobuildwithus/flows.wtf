import { ponder, type Context, type Event } from "ponder:registry"
import { grants } from "ponder:schema"

ponder.on("CustomFlow:FlowImplementationSet", handleFlowImplementationSet)
ponder.on("NounsFlow:FlowImplementationSet", handleFlowImplementationSet)
ponder.on("NounsFlowChildren:FlowImplementationSet", handleFlowImplementationSet)

async function handleFlowImplementationSet(params: {
  event: Event<"CustomFlow:FlowImplementationSet">
  context: Context<"CustomFlow:FlowImplementationSet">
}) {
  const { event, context } = params
  const { flowImpl } = event.args

  const grantId = event.log.address.toLowerCase()

  const grant = await context.db.find(grants, { id: grantId })

  if (!grant) {
    return
  }

  await context.db.update(grants, { id: grantId }).set({
    flowImpl: flowImpl,
  })
}
