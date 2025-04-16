"use server"

import database, { getCacheStrategy } from "@/lib/database/edge"
import { getEthAddress } from "@/lib/utils"
import { Status } from "@/lib/enums"
import { getUserProfile } from "@/components/user-profile/get-user-profile"

export async function getRemovedGrants(flowId: string, type: "removed" | "rejected") {
  const grants = await database.grant.findMany({
    where:
      type === "removed"
        ? { flowId, isRemoved: true }
        : { flowId, status: Status.Absent, isRemoved: false },
    omit: { description: true },
    include: {
      evidences: true,
      disputes: { include: { evidences: true } },
    },
    ...getCacheStrategy(120),
  })

  return await Promise.all(
    grants.map(async (grant) => {
      const [profile, reinstatedGrant] = await Promise.all([
        getUserProfile(getEthAddress(grant.recipient)),
        database.grant.findFirst({
          where: {
            flowId,
            recipient: grant.recipient,
            isActive: true,
          },
          omit: { description: true },
        }),
      ])

      const numEvidences = grant.evidences.length
      const latestDispute = grant.disputes[grant.disputes.length - 1]

      const relevantEvidence = latestDispute?.evidences[0] || grant.evidences[numEvidences - 1]

      const disputeReason = relevantEvidence?.evidence || "No reason provided"
      const challenger = relevantEvidence?.party

      const cancelledByBuilder = grant.recipient === challenger

      return {
        profile,
        disputeReason,
        reinstatedGrant,
        challenger,
        cancelledByBuilder,
        ...grant,
      }
    }),
  )
}

export type RemovedGrant = Awaited<ReturnType<typeof getRemovedGrants>>[number]
