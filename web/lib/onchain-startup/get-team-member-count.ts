"use server"

import { unstable_cache } from "next/cache"
import database from "@/lib/database/flows-db"

async function _getTeamMemberCount(id: string) {
  const mainFlow = await database.grant.findFirstOrThrow({
    select: { manager: true, parentContract: true, rootContract: true },
    where: { id, isFlow: true, isActive: true },
    orderBy: { createdAt: "asc" },
  })

  const budgets = await database.grant.findMany({
    omit: { description: true },
    where: {
      manager: mainFlow.manager,
      isFlow: true,
      isActive: true,
      rootContract: mainFlow.rootContract,
    },
    orderBy: { createdAt: "asc" },
    include: {
      subgrants: {
        where: { isActive: true, isSiblingFlow: false },
        select: { recipient: true },
      },
    },
  })

  return new Set(budgets.map((b) => b.subgrants.map((s) => s.recipient)).flat()).size
}

export const getTeamMemberCount = unstable_cache(_getTeamMemberCount, ["team-member-count"], {
  tags: ["team-member-count"],
  revalidate: 15 * 60, // 15 minutes
})
