"use server"

import { getUser } from "@/lib/auth/user"
import database from "@/lib/database/flows-db"
import { isAdmin } from "@/lib/database/helpers"
import { canAllocate } from "@/lib/allocation/can-allocate"
import { z } from "zod"

const schema = z.object({
  position: z.string().trim().min(1, "Position name is required"),
  description: z.string().trim().min(1, "Description is required"),
  applicationRequirements: z.string().trim().min(1, "Application requirements are required"),
  flowId: z.string().trim().min(1, "Budget is required"),
  startupId: z.string().trim().min(1, "Startup ID is required"),
  expectedMonthlySalary: z.string(),
})

export async function createOpportunity(formData: FormData) {
  try {
    const user = await getUser()
    if (!user) throw new Error("Unauthorized")

    const validation = schema.safeParse(Object.fromEntries(formData))

    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors
      console.error(errors)
      throw new Error(Object.values(errors).flat().join(", "))
    }

    const expectedMonthlySalary = Number(validation.data.expectedMonthlySalary)
    if (expectedMonthlySalary < 5) throw new Error("Expected monthly salary must be at least $5")

    // Fetch allocationStrategies and chainId for canAllocate
    const budget = await database.grant.findUnique({
      where: { id: validation.data.flowId },
      select: { allocationStrategies: true, chainId: true },
    })

    if (!budget) throw new Error("Budget not found")

    // Use canAllocate to check if user can manage this opportunity
    const canUserAllocate = await canAllocate(
      budget.allocationStrategies,
      budget.chainId,
      user.address,
    )

    const canManage = canUserAllocate || isAdmin(user.address)
    if (!canManage) throw new Error("Unauthorized")

    await database.opportunity.create({
      data: {
        ...validation.data,
        expectedMonthlySalary: Number(validation.data.expectedMonthlySalary),
      },
    })

    return { error: false }
  } catch (error) {
    console.error(error)
    return { error: (error as Error).message || "Failed to create opportunity" }
  }
}
