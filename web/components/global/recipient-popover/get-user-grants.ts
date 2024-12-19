"use server"

import database from "@/lib/database/edge"
import { unstable_cache } from "next/cache"

export const getUserGrants = unstable_cache(
  async (address: `0x${string}`) => {
    if (!address) return []

    const grants = await database.grant.findMany({
      where: {
        recipient: address,
        isFlow: false,
        isRemoved: false,
      },
      select: {
        flow: true,
        id: true,
        title: true,
        image: true,
        monthlyIncomingFlowRate: true,
        totalEarned: true,
        baselinePool: true,
        bonusPool: true,
        parentContract: true,
      },
      orderBy: {
        totalEarned: "desc",
      },
    })

    return grants
  },
  ["user-grants"],
  { revalidate: 60 }, // 1 minute
)
