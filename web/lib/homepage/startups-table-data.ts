"use server"

import { getAllStartupsWithIds, getStartup } from "@/lib/onchain-startup/startup"
import { getTotalRevenue } from "@/lib/onchain-startup/get-total-revenue"
import { getRevnetBalance } from "@/lib/revnet/hooks/get-revnet-balance"
import { base as baseChain } from "viem/chains"
import { getTeamMembers } from "@/lib/onchain-startup/team-members"
import type { StartupWithRevenue } from "@/components/homepage/types"
import { unstable_cache } from "next/cache"

async function _getStartupsTableData(): Promise<StartupWithRevenue[]> {
  const startups = getAllStartupsWithIds()

  const revenue = await getTotalRevenue(startups)

  const startupsWithData = await Promise.all(
    startups.map(async (startup) => {
      const startupData = await getStartup(startup.id)
      const revenueData = revenue.revenueByProjectId.get(startup.id)
      const projectIdBase = startup.jbxProjectId
      const [team, revnet] = await Promise.all([
        getTeamMembers(startup.id),
        projectIdBase
          ? getRevnetBalance(projectIdBase, baseChain.id).catch(() => ({
              participantsCount: 0,
            }))
          : Promise.resolve({ participantsCount: 0 }),
      ])

      const safeTeam = team.map((m) => {
        // ensure fid is number not bigint
        const { fid, ...rest } = m as any
        return { ...rest, fid: typeof fid === "bigint" ? Number(fid) : fid }
      })

      return {
        ...startup,
        ...startupData,
        shortMission: startup.shortMission || startupData.tagline || "",
        revenue: revenueData?.totalSales ?? 0,
        salesChange: revenueData?.salesChange ?? 0,
        backers: revnet.participantsCount,
        projectIdBase: projectIdBase,
        chainId: baseChain.id,
        team: safeTeam,
        isBackedByFlows: startupData.isBackedByFlows,
      }
    }),
  )

  return startupsWithData.sort((a, b) => b.revenue - a.revenue)
}

export const getStartupsTableData = unstable_cache(_getStartupsTableData, ["startups-table"], {
  tags: ["startups-table-data"],
  revalidate: 180,
})
