"use server"

import { unstable_cache } from "next/cache"
import database from "@/lib/database/flows-db"

async function _getHiringEvents(id: string) {
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
      parentContract: { not: mainFlow.rootContract },
      isTopLevel: false,
    },
    orderBy: { createdAt: "asc" },
    include: {
      subgrants: {
        where: { isActive: true, isFlow: false, isSiblingFlow: false },
        select: {
          recipient: true,
          monthlyIncomingFlowRate: true,
          activatedAt: true,
          createdAt: true,
        },
      },
    },
  })

  const hiringEvents = budgets.flatMap((budget) =>
    budget.subgrants
      .filter((subgrant) => subgrant.recipient !== mainFlow.manager)
      .map((subgrant) => ({
        recipient: subgrant.recipient,
        hiredAt: (subgrant.activatedAt || subgrant.createdAt) * 1000,
        monthlyFlowRate: subgrant.monthlyIncomingFlowRate,
      })),
  )

  return hiringEvents
}

export type HiringEvent = Awaited<ReturnType<typeof _getHiringEvents>>[0]

export const getHiringEvents = unstable_cache(_getHiringEvents, ["hiring-events"], {
  tags: ["hiring-events"],
  revalidate: 15 * 60, // 15 minutes
})
