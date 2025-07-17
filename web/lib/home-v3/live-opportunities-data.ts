"use server"

import database from "@/lib/database/flows-db"
import { getStartupData } from "@/lib/onchain-startup/startup"
import type { OpportunityWithCount, FlowWithDisplayAmount } from "@/app/home-v3/types"
import { unstable_cache } from "next/cache"

async function _getLiveOpportunitiesData(): Promise<{
  opportunities: OpportunityWithCount[]
  flows: FlowWithDisplayAmount[]
}> {
  const opportunitiesRaw = await database.opportunity.findMany({
    where: { status: 1 },
    include: { _count: { select: { drafts: true } } },
    orderBy: { createdAt: "desc" },
  })

  const opportunities: OpportunityWithCount[] = opportunitiesRaw
    .filter((opportunity) => {
      try {
        getStartupData(opportunity.startupId)
        return true
      } catch {
        return false
      }
    })
    .map((opportunity) => ({
      ...opportunity,
      startup: getStartupData(opportunity.startupId),
    }))

  const flowsRaw = await database.grant.findMany({
    where: { isFlow: true, isActive: true, isTopLevel: false },
    select: {
      id: true,
      title: true,
      image: true,
      tagline: true,
      monthlyIncomingFlowRate: true,
      activeRecipientCount: true,
      monthlyOutgoingFlowRate: true,
      underlyingTokenDecimals: true,
      underlyingTokenPrefix: true,
      underlyingTokenSymbol: true,
    },
    orderBy: [{ title: "asc" }],
  })

  const flows: FlowWithDisplayAmount[] = flowsRaw
    .sort((a, b) => Number(b.monthlyIncomingFlowRate) - Number(a.monthlyIncomingFlowRate))
    .map((flow) => ({
      ...flow,
      displayAmount: Number(flow.monthlyOutgoingFlowRate) / (flow.activeRecipientCount || 1),
    }))

  return { opportunities, flows }
}

export const getLiveOpportunitiesData = unstable_cache(_getLiveOpportunitiesData, ["live-ops"], {
  tags: ["live-ops"],
  revalidate: 60,
})
