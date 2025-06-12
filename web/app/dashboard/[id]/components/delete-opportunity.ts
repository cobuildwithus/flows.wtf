"use server"

import { getUser } from "@/lib/auth/user"
import database from "@/lib/database/flows-db"
import { isAdmin } from "@/lib/database/helpers"
import { canAllocate } from "@/lib/allocation/can-allocate"

export async function deleteOpportunity(id: string) {
  try {
    const user = await getUser()
    if (!user) throw new Error("Unauthorized")

    // Fetch opportunity with budget info needed for canAllocate
    const opportunity = await database.opportunity.findUnique({
      where: { id },
      select: {
        flowId: true,
        // Get the budget (grant) with allocationStrategies and chainId
        budget: {
          select: {
            allocationStrategies: true,
            chainId: true,
          },
        },
      },
    })

    if (!opportunity || !opportunity.budget) throw new Error("Opportunity not found")

    // Use canAllocate to check if user can manage this opportunity
    const canUserAllocate = await canAllocate(
      opportunity.budget.allocationStrategies,
      opportunity.budget.chainId,
      user.address,
    )

    const canManage = canUserAllocate || isAdmin(user.address)
    if (!canManage) throw new Error("Unauthorized")

    await database.opportunity.update({ where: { id }, data: { status: 0 } })

    return { error: false }
  } catch (error) {
    console.error(error)
    return { error: (error as Error).message || "Failed to delete opportunity" }
  }
}
