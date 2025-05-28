"use server"

import database from "@/lib/database/flows-db"

export async function getGrant(grantId: string) {
  return database.grant.findUniqueOrThrow({
    where: { id: grantId, isTopLevel: false },
    include: {
      flow: true,
      derivedData: {
        select: {
          title: true,
          tagline: true,
          coverImage: true,
          shortDescription: true,
          mission: true,
          builder: true,
          gradients: true,
          deliverables: true,
          beneficiaries: true,
          overallGrade: true,
          requirementsMetrics: true,
          impactMetrics: true,
          impactSummary: true,
        },
      },
    },
  })
}
