"use server"

import database from "@/lib/database/flows-db"
import { unstable_cache } from "next/cache"

async function _getTopLevelFlows() {
  const flows = await database.grant.findMany({
    where: {
      isTopLevel: true,
      isFlow: true,
      isActive: true,
    },
    select: {
      id: true,
      title: true,
      description: true,
      image: true,
      tagline: true,
      totalPaidOut: true,
      activeRecipientCount: true,
      monthlyOutgoingFlowRate: true,
      underlyingTokenSymbol: true,
      underlyingTokenPrefix: true,
    },
    orderBy: [
      {
        totalEarned: "desc",
      },
      {
        activeRecipientCount: "desc",
      },
    ],
  })

  return flows
}

export const getTopLevelFlows = unstable_cache(_getTopLevelFlows, ["top-level-flows"], {
  revalidate: 300, // Cache for 5 minutes
  tags: ["top-level-flows"],
})
