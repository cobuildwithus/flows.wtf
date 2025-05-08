import { ponder, type Context, type Event } from "ponder:registry"
import { flowContractToGrantId, grants } from "ponder:schema"

ponder.on("NounsFlow:BaselineFlowRatePercentUpdated", handleBaselineFlowRatePercentUpdated)
ponder.on("NounsFlowChildren:BaselineFlowRatePercentUpdated", handleBaselineFlowRatePercentUpdated)
ponder.on("VrbsFlow:BaselineFlowRatePercentUpdated", handleBaselineFlowRatePercentUpdated)
ponder.on("VrbsFlowChildren:BaselineFlowRatePercentUpdated", handleBaselineFlowRatePercentUpdated)

async function handleBaselineFlowRatePercentUpdated(params: {
  event: Event<"NounsFlow:BaselineFlowRatePercentUpdated">
  context: Context<"NounsFlow:BaselineFlowRatePercentUpdated">
}) {
  const { event, context } = params
  const { newBaselineFlowRatePercent } = event.args
  const flow = event.log.address.toLowerCase()

  const grant = await context.db.find(flowContractToGrantId, { contract: flow })
  if (!grant) throw new Error("Flow not found")

  if (!grant) {
    console.error({ flow })
    throw new Error(`Grant not found: ${flow}`)
  }

  await context.db.update(grants, { id: grant.grantId }).set({
    baselinePoolFlowRatePercent: newBaselineFlowRatePercent,
    updatedAt: Number(event.block.timestamp),
  })
}
