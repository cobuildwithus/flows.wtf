import { ponder, type Context, type Event } from "ponder:registry"
import { handleIncomingFlowRates } from "./lib/handle-incoming-flow-rates"
import { grants } from "ponder:schema"

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

  // Compute monthly flow in wei (bigint): flowRate [wei/s] * secondsPerMonth
  const newMonthlyRate = newTotalDistributionFlowRate * BigInt(60 * 60 * 24 * 30)

  if (pool === grant.baselinePool) {
    if (grant.monthlyBaselinePoolFlowRate !== newMonthlyRate) {
      const monthlyOutgoingFlowRate =
        grant.monthlyRewardPoolFlowRate + grant.monthlyBonusPoolFlowRate + newMonthlyRate

      await context.db.update(grants, { id: grant.id }).set({
        monthlyBaselinePoolFlowRate: newMonthlyRate,
        monthlyOutgoingFlowRate: monthlyOutgoingFlowRate,
        updatedAt: Number(event.block.timestamp),
      })

      await handleIncomingFlowRates(context.db, distributor)
    }
  }

  if (pool === grant.managerRewardSuperfluidPool) {
    if (grant.monthlyRewardPoolFlowRate !== newMonthlyRate) {
      const monthlyOutgoingFlowRate =
        grant.monthlyBaselinePoolFlowRate + grant.monthlyBonusPoolFlowRate + newMonthlyRate

      await context.db.update(grants, { id: grant.id }).set({
        monthlyRewardPoolFlowRate: newMonthlyRate,
        monthlyOutgoingFlowRate: monthlyOutgoingFlowRate,
        updatedAt: Number(event.block.timestamp),
      })
    }
  }

  if (pool === grant.bonusPool) {
    if (grant.monthlyBonusPoolFlowRate !== newMonthlyRate) {
      const monthlyOutgoingFlowRate =
        grant.monthlyBaselinePoolFlowRate + grant.monthlyRewardPoolFlowRate + newMonthlyRate

      await context.db.update(grants, { id: grant.id }).set({
        monthlyBonusPoolFlowRate: newMonthlyRate,
        monthlyOutgoingFlowRate: monthlyOutgoingFlowRate,
        updatedAt: Number(event.block.timestamp),
      })

      await handleIncomingFlowRates(context.db, distributor)
    }
  }
}

// Monthly rate now computed in bigint above

async function getGrant(db: Context["db"], distributor: string) {
  const grantIdFlow = await db.find(grants, { id: distributor })
  if (grantIdFlow) return grantIdFlow

  // const grantIdRewardPool = await db.find(rewardPoolContractToGrantId, { contract: distributor })
  // if (grantIdRewardPool) return db.find(grants, { id: grantIdRewardPool.grantId })

  return null
}
