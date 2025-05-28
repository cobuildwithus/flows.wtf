"use server"

import { getUser } from "@/lib/auth/user"
import database from "@/lib/database/flows-db"
import { canEditGrant } from "@/lib/database/helpers"
import { postImpactSummaryRequest } from "@/lib/embedding/queue"

export async function deleteImpact(impactId: string) {
  try {
    const user = await getUser()
    if (!user) throw new Error("User not found")

    const impact = await database.impact.findUnique({
      where: { id: impactId },
      include: { grant: { select: { recipient: true } } },
    })

    if (!impact) throw new Error("Impact not found")

    if (!canEditGrant(impact.grant, user.address)) {
      console.error("Unauthorized")
      throw new Error("Failed to delete impact")
    }

    await database.impact.update({
      where: { id: impactId },
      data: { deletedAt: new Date() },
    })

    await postImpactSummaryRequest([{ grantId: impact.grantId }])

    return { error: false, grantId: impact.grantId }
  } catch (error) {
    return { error: (error as Error).message || "Failed to delete impact" }
  }
}
