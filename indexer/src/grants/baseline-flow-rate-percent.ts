import { ponder, type Context, type Event } from "ponder:registry"
import { grants } from "ponder:schema"

ponder.on("NounsFlow:BaselineFlowRatePercentUpdated", handleBaselineFlowRatePercentUpdated)
ponder.on("NounsFlowChildren:BaselineFlowRatePercentUpdated", handleBaselineFlowRatePercentUpdated)
ponder.on("CustomFlow:BaselineFlowRatePercentUpdated", handleBaselineFlowRatePercentUpdated)

async function handleBaselineFlowRatePercentUpdated(params: {
  event: Event<"CustomFlow:BaselineFlowRatePercentUpdated">
  context: Context<"CustomFlow:BaselineFlowRatePercentUpdated">
}) {
  const { event, context } = params
  const { newBaselineFlowRatePercent } = event.args
  const grantId = event.log.address.toLowerCase()

  await context.db.update(grants, { id: grantId }).set({
    baselinePoolFlowRatePercent: newBaselineFlowRatePercent,
    updatedAt: Number(event.block.timestamp),
  })
}
