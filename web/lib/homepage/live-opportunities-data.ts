"use server"

import database from "@/lib/database/flows-db"
import type { OpportunityWithCount, FlowWithDisplayAmount } from "@/components/homepage/types"
import { unstable_cache } from "next/cache"
import { fromWei } from "@/lib/utils"

async function _getLiveOpportunitiesData(): Promise<{
  opportunities: OpportunityWithCount[]
  flows: FlowWithDisplayAmount[]
}> {
  const opportunities = await database.opportunity.findMany({
    where: { status: 1 },
    orderBy: { createdAt: "desc" },
    include: {
      startup: {
        select: {
          id: true,
          title: true,
          image: true,
        },
      },
    },
  })

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
    .sort((a, b) => fromWei(b.monthlyIncomingFlowRate) - fromWei(a.monthlyIncomingFlowRate))
    .map((flow) => ({
      ...flow,
      displayAmount: fromWei(flow.monthlyOutgoingFlowRate) / (flow.activeRecipientCount || 1),
    }))

  return { opportunities, flows }
}

export const getLiveOpportunitiesData = unstable_cache(_getLiveOpportunitiesData, ["live-ops"], {
  tags: ["live-ops"],
  revalidate: 60,
})
