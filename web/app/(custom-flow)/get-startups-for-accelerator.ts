"use server"

import { getStartups } from "@/lib/onchain-startup/startup"
import { getTotalRevenue } from "@/lib/onchain-startup/get-total-revenue"
import { getRevnetBalance } from "@/lib/revnet/hooks/get-revnet-balance"
import { base as baseChain } from "viem/chains"
import { getTeamMembers } from "@/lib/onchain-startup/team-members"
import { unstable_cache } from "next/cache"

export async function getStartupsForAccelerator(flowId: string) {
  const startups = await getStartups(flowId)

  const revenue = await getTotalRevenue(startups)

  const startupsWithData = await Promise.all(
    startups.map(async (startup) => {
      const revenueData = revenue.revenueByProjectId.get(startup.id)
      const [team, revnet] = await Promise.all([
        getTeamMembers(startup.id),
        startup.revnetProjectId
          ? getRevnetBalance(startup.revnetProjectId, baseChain.id).catch(() => ({
              participantsCount: 0,
            }))
          : null,
      ])

      const safeTeam = team.map((m) => {
        // ensure fid is number not bigint
        const { fid, ...rest } = m as any
        return { ...rest, fid: typeof fid === "bigint" ? Number(fid) : fid }
      })

      return {
        ...startup,
        revenue: revenueData?.totalSales ?? 0,
        salesChange: revenueData?.salesChange ?? 0,
        backers: revnet?.participantsCount ?? 0,
        projectIdBase: startup.revnetProjectId,
        chainId: baseChain.id,
        team: safeTeam,
      }
    }),
  )

  return startupsWithData.sort((a, b) => b.revenue - a.revenue)
}

// export const getStartupsForAccelerator = unstable_cache(
//   _getStartupsForAccelerator,
//   ["startups-for-accelerator"],
//   {
//     tags: ["startups-for-accelerator"],
//     revalidate: 180,
//   },
// )
