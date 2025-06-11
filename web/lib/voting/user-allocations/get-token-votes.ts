"use server"

import { PERCENTAGE_SCALE } from "@/lib/config"
import database from "@/lib/database/flows-db"

export async function getTokenVotes(contract: `0x${string}`, tokenIds: string[]) {
  if (!tokenIds.length) return []

  const allocations = await database.allocation.findMany({
    select: {
      bps: true,
      recipientId: true,
      allocationsCount: true,
      grant: { select: { isActive: true } },
    },
    where: {
      contract,
      allocationKey: { in: tokenIds },
    },
    distinct: ["recipientId"],
  })

  return allocations
    .filter((allocation) => allocation.grant.isActive)
    .map((allocation) => ({ ...allocation, bps: (allocation.bps / PERCENTAGE_SCALE) * 10000 }))
}
