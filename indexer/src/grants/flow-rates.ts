import { ponder, type Context, type Event } from "ponder:registry"
import { handleIncomingFlowRates } from "./lib/handle-incoming-flow-rates"
import { flowContractToGrantId, grants, rewardPoolContractToGrantId } from "ponder:schema"

ponder.on("GdaV1:FlowDistributionUpdated", handleFlowDistributionUpdated)

async function handleFlowDistributionUpdated(params: {
  event: Event<"GdaV1:FlowDistributionUpdated">
  context: Context<"GdaV1:FlowDistributionUpdated">
}) {
  const { event, context } = params

  const { pool: rawPool, distributor: rawDistributor, newTotalDistributionFlowRate } = event.args
  const pool = rawPool.toLowerCase()
  const distributor = rawDistributor.toLowerCase()

  const grant = await getGrant(context.db, distributor)
  if (!grant) return

  const newMonthlyRate = getMonthlyFlowRate(newTotalDistributionFlowRate)

  if (pool === grant.baselinePool) {
    const monthlyOutgoingFlowRate =
      Number(grant.monthlyRewardPoolFlowRate) +
      Number(grant.monthlyBonusPoolFlowRate) +
      newMonthlyRate

    await context.db.update(grants, { id: grant.id }).set({
      monthlyBaselinePoolFlowRate: newMonthlyRate.toString(),
      monthlyOutgoingFlowRate: monthlyOutgoingFlowRate.toString(),
      updatedAt: Number(event.block.timestamp),
    })

    await handleIncomingFlowRates(context.db, distributor)
  }

  if (pool === grant.managerRewardSuperfluidPool) {
    const monthlyOutgoingFlowRate =
      Number(grant.monthlyBaselinePoolFlowRate) +
      Number(grant.monthlyBonusPoolFlowRate) +
      newMonthlyRate

    await context.db.update(grants, { id: grant.id }).set({
      monthlyRewardPoolFlowRate: newMonthlyRate.toString(),
      monthlyOutgoingFlowRate: monthlyOutgoingFlowRate.toString(),
      updatedAt: Number(event.block.timestamp),
    })
  }

  if (pool === grant.bonusPool) {
    const monthlyOutgoingFlowRate =
      Number(grant.monthlyBaselinePoolFlowRate) +
      Number(grant.monthlyRewardPoolFlowRate) +
      newMonthlyRate

    await context.db.update(grants, { id: grant.id }).set({
      monthlyBonusPoolFlowRate: newMonthlyRate.toString(),
      monthlyOutgoingFlowRate: monthlyOutgoingFlowRate.toString(),
      updatedAt: Number(event.block.timestamp),
    })

    await handleIncomingFlowRates(context.db, distributor)
  }
}

const getMonthlyFlowRate = (flowRate: bigint) => {
  return (Number(flowRate) * 60 * 60 * 24 * 30) / 1e18
}

async function getGrant(db: Context["db"], distributor: string) {
  const grantIdFlow = await db.find(flowContractToGrantId, { contract: distributor })
  const grantIdRewardPool = await db.find(rewardPoolContractToGrantId, { contract: distributor })
  const grantId = grantIdFlow?.grantId ?? grantIdRewardPool?.grantId

  if (!grantId) return null

  const grant = await db.find(grants, { id: grantId })
  if (!grant) throw new Error(`Grant not found: ${grantId}`)
  return grant
}
