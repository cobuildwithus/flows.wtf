import database from "@/lib/database/flows-db"
import { getUserProfile } from "@/components/user-profile/get-user-profile"
import { getEthAddress } from "@/lib/utils"
import { getStartupBudgets } from "./budgets"

export const getBudgetsWithGrants = async (id: string) => {
  const budgets = await getStartupBudgets(id)

  const budgetsWithProfiles = await Promise.all(
    budgets.map(async (budget) => {
      const subgrantsWithProfiles = await Promise.all(
        budget.subgrants.map(async (subgrant) => {
          const profile = await getUserProfile(getEthAddress(subgrant.recipient))
          return { ...subgrant, profile }
        }),
      )

      return {
        ...budget,
        title: budget.id === id ? "Main Budget" : budget.title,
        subgrants: subgrantsWithProfiles,
      }
    }),
  )

  return budgetsWithProfiles
}

export type BudgetWithGrants = Awaited<ReturnType<typeof getBudgetsWithGrants>>[number]
