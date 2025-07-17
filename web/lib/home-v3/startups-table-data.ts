"use server"

import { getAllStartupsWithIds, getStartupData } from "@/lib/onchain-startup/startup"
import { getTotalRevenue } from "@/lib/onchain-startup/get-total-revenue"
import { getRevnetBalance } from "@/lib/revnet/hooks/get-revnet-balance"
import { base as baseChain } from "viem/chains"
import { getAccelerator } from "@/lib/onchain-startup/data/accelerators"
import { getTeamMembers } from "@/lib/onchain-startup/team-members"
import type { StartupWithRevenue } from "@/app/home-v3/types"
import { unstable_cache } from "next/cache"

async function _getStartupsTableData(): Promise<StartupWithRevenue[]> {
  const startups = getAllStartupsWithIds()

  const revenue = await getTotalRevenue(startups)

  return Promise.all(
    startups.map(async (startup) => {
      const revenueData = revenue.revenueByProjectId.get(startup.id)
      const accelerator = getAccelerator(startup.acceleratorId)
      const [team, revnet] = await Promise.all([
        getTeamMembers(startup.id),
        getRevnetBalance(startup.revnetProjectIds.base, baseChain.id).catch(() => ({
          participantsCount: 0,
        })),
      ])

      return {
        id: startup.id,
        title: startup.title,
        shortMission: startup.shortMission,
        image: startup.image,
        revenue: revenueData?.totalSales ?? 0,
        salesChange: revenueData?.salesChange ?? 0,
        backers: revnet.participantsCount,
        projectIdBase: startup.revnetProjectIds.base.toString(),
        chainId: baseChain.id,
        team,
        acceleratorColor: accelerator.color,
      } satisfies StartupWithRevenue
    }),
  )
}

export const getStartupsTableData = unstable_cache(_getStartupsTableData, ["startups-table"], {
  tags: ["startups-table"],
  revalidate: 180,
})
