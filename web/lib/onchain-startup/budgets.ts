"use server"

import { unstable_cache } from "next/cache"
import database from "@/lib/database/flows-db"

async function _getStartupBudgets(id: string) {
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
        where: { isActive: true },
        omit: { description: true },
        include: { derivedData: true },
      },
    },
  })

  return budgets
    .map((budget) => ({
      ...budget,
      title: budget.id === id ? "Main Budget" : budget.title,
    }))
    .filter((b) => !b.isAccelerator)
}

export type StartupBudget = Awaited<ReturnType<typeof _getStartupBudgets>>[0]

export const getStartupBudgets = unstable_cache(_getStartupBudgets, ["startup-budgets"], {
  tags: ["startup-budgets"],
  revalidate: 15 * 60, // 15 minutes
})
