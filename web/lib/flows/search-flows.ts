"use server"

import { unstable_cache } from "next/cache"
import database from "@/lib/database/flows-db"
import type { FlowSearchResult } from "./types"

async function _searchFlows({
  query,
  limit = 10,
  superToken,
  chainId,
  excludeFlowId,
}: {
  query: string
  limit?: number
  superToken?: string
  chainId?: number
  excludeFlowId?: string
}): Promise<FlowSearchResult[]> {
  if (!query || query.length < 2) {
    return []
  }

  const whereConditions: any = {
    isFlow: true,
    isActive: true,
    OR: [
      {
        title: {
          contains: query,
          mode: "insensitive",
        },
      },
      {
        description: {
          contains: query,
          mode: "insensitive",
        },
      },
      {
        tagline: {
          contains: query,
          mode: "insensitive",
        },
      },
    ],
  }

  // Filter by same superToken and chainId if provided
  if (superToken) {
    whereConditions.superToken = superToken
  }
  if (chainId) {
    whereConditions.chainId = chainId
  }

  // Exclude the current flow to prevent self-referencing
  if (excludeFlowId) {
    whereConditions.id = {
      not: excludeFlowId,
    }
  }

  const flows = await database.grant.findMany({
    where: whereConditions,
    select: {
      id: true,
      title: true,
      description: true,
      image: true,
      tagline: true,
      recipient: true,
      chainId: true,
      isActive: true,
      monthlyIncomingFlowRate: true,
      monthlyOutgoingFlowRate: true,
      superToken: true,
      activeRecipientCount: true,
    },
    orderBy: [
      {
        monthlyOutgoingFlowRate: "desc", // Prioritize flows with active outgoing rates
      },
      {
        activeRecipientCount: "desc",
      },
      {
        monthlyIncomingFlowRate: "desc",
      },
    ],
    take: limit,
  })

  // Filter out flows that don't have active outgoing flow rates
  const activeFlows = flows.filter(
    (flow) => flow.monthlyOutgoingFlowRate && flow.monthlyOutgoingFlowRate !== "0",
  )

  return activeFlows
}

export const searchFlows = unstable_cache(_searchFlows, ["search-flows"], {
  revalidate: 60, // Cache for 60 seconds
  tags: ["flows"],
})
