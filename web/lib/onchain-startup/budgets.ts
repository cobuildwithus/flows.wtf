"use server"

import { unstable_cache } from "next/cache"
import database from "@/lib/database/flows-db"

export const getStartupBudgets = unstable_cache(
  async (id: string) => {
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
          where: { isActive: true },
          include: { derivedData: true },
        },
      },
    })

    return budgets.map((budget) => ({
      ...budget,
      title: budget.id === id ? "Main Budget" : budget.title,
    }))
  },
  ["startup-budgets"],
  {
    tags: ["startup-budgets"],
    revalidate: 15 * 60, // 15 minutes
  },
)
