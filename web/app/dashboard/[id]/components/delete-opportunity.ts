"use server"

import { getUser } from "@/lib/auth/user"
import database from "@/lib/database/flows-db"
import { isAdmin } from "@/lib/database/helpers"

export async function deleteOpportunity(id: string) {
  try {
    const user = await getUser()
    if (!user) throw new Error("Unauthorized")

    const opportunity = await database.opportunity.findUnique({
      where: { id },
      select: { budget: { select: { allocator: true } } },
    })

    if (!opportunity) throw new Error("Opportunity not found")

    const canManage = user.address === opportunity.budget.allocator || isAdmin(user.address)
    if (!canManage) throw new Error("Unauthorized")

    await database.opportunity.update({ where: { id }, data: { status: 0 } })

    return { error: false }
  } catch (error) {
    console.error(error)
    return { error: (error as Error).message || "Failed to delete opportunity" }
  }
}
