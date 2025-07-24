"use server"

import database from "@/lib/database/flows-db"
import { getAllStartupsWithIds } from "@/lib/onchain-startup/startup"
import { getTotalRevenue } from "@/lib/onchain-startup/get-total-revenue"
import { getGrowthEvents } from "@/lib/onchain-startup/growth-events"
import { getTotalBuilders } from "@/lib/onchain-startup/total-builders"
import { unstable_cache } from "next/cache"
import { REWARD_POOL_PAYOUT, VRBS_GRANTS_PAYOUTS } from "./old-grants-data"

function calculateTotalOutgoingFlowRate(
  flows: Array<{ id: string; monthlyOutgoingFlowRate: string; flowId?: string }>,
): number {
  return flows
    .filter((flow) => !flows.some((otherFlow) => otherFlow.flowId === flow.id))
    .reduce((total, flow) => {
      const flowRate = parseFloat(flow.monthlyOutgoingFlowRate)
      return total + (isNaN(flowRate) ? 0 : flowRate)
    }, 0)
}

async function _getHeroStats() {
  const grants = await database.grant.findMany({
    where: { isFlow: true },
    select: { totalEarned: true, monthlyOutgoingFlowRate: true, flowId: true, id: true },
  })

  const startups = getAllStartupsWithIds()
  const [revenue, growthEvents, totalBuilders] = await Promise.all([
    getTotalRevenue(startups),
    getGrowthEvents(),
    getTotalBuilders(),
  ])

  const totalMonthlyFlowRate = calculateTotalOutgoingFlowRate(grants)
  const totalEarned =
    grants.reduce((acc, grant) => acc + Number(grant.totalEarned), 0) +
    VRBS_GRANTS_PAYOUTS +
    REWARD_POOL_PAYOUT +
    revenue.totalRevenue

  return {
    totalEarned,
    totalMonthlyFlowRate,
    totalBuilders,
    growthEvents,
  }
}

export const getHeroStats = unstable_cache(_getHeroStats, ["hero-stats"], {
  tags: ["hero-stats"],
  revalidate: 120, // 2 minutes
})
