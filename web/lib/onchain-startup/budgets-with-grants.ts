import database from "@/lib/database/flows-db"
import { getUserProfile } from "@/components/user-profile/get-user-profile"
import { getEthAddress } from "@/lib/utils"

export const getBudgetsWithGrants = async (id: string, allocator: string) => {
  const budgets = await database.grant.findMany({
    omit: { description: true },
    where: { allocator, isFlow: true, isActive: true },
    orderBy: { createdAt: "asc" },
    include: {
      subgrants: {
        where: { isActive: true },
        include: { derivedData: true },
      },
    },
  })

  const budgetsWithProfiles = await Promise.all(
    budgets.map(async (budget) => {
      const subgrantsWithProfiles = await Promise.all(
        budget.subgrants.map(async (subgrant) => {
          const profile = await getUserProfile(
            getEthAddress(subgrant.allocator || subgrant.recipient),
          )
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
