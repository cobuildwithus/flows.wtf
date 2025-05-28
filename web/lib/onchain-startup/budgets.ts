import database from "@/lib/database/flows-db"
import { unstable_cache } from "next/cache"

export const getStartupBudgets = unstable_cache(
  async (id: string, allocator: string) => {
    const budgets = await database.grant.findMany({
      select: { id: true, title: true, monthlyIncomingFlowRate: true },
      where: { allocator, isFlow: true, isActive: true },
      orderBy: { createdAt: "asc" },
    })

    return budgets.map((budget) => ({
      ...budget,
      title: budget.id === id ? "Main Budget" : budget.title,
    }))
  },
  ["startup-budget"],
  {
    tags: ["startup-budget"],
    revalidate: 60 * 60 * 3, // 3 hours
  },
)
