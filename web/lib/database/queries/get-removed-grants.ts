"use server"

import database from "@/lib/database/flows-db"
import { getEthAddress } from "@/lib/utils"
import { Status } from "@/lib/enums"
import { getUserProfile } from "@/components/user-profile/get-user-profile"
import { unstable_cache } from "next/cache"

function getWhereCondition(flowId: string, isTopLevel: boolean, type: "removed" | "rejected") {
  const removed = type === "removed"
  const rejected = { status: Status.Absent, isRemoved: false }
  return isTopLevel
    ? { isFlow: false, ...(removed ? { isRemoved: true } : rejected) }
    : { flowId, ...(removed ? { isRemoved: true } : rejected) }
}

export async function getRemovedGrantsForTopLevel() {
  return await database.grant.findMany({
    where: { isFlow: false, isRemoved: true },
    omit: { description: true },
    include: {
      derivedData: { select: { deliverablesCompletionRate: true } },
    },
  })
}

export async function getRemovedGrants(
  flowId: string,
  isTopLevel: boolean,
  type: "removed" | "rejected",
) {
  const whereCondition = getWhereCondition(flowId, isTopLevel, type)
  const grants = await database.grant.findMany({
    where: whereCondition,
    omit: { description: true },
    include: {
      evidences: true,
      disputes: { include: { evidences: true } },
      derivedData: { select: { deliverablesCompletionRate: true } },
    },
  })

  return await Promise.all(
    grants.map(async (grant) => {
      const [profile, reinstatedGrant] = await Promise.all([
        getUserProfile(getEthAddress(grant.recipient)),
        getGrant(flowId, grant.recipient),
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

const getGrant = unstable_cache(
  async (flowId: string, recipient: string) => {
    return database.grant.findFirst({
      where: {
        flowId,
        recipient,
        isActive: true,
      },
      omit: { description: true },
    })
  },
  ["get-grant-by-flow-recipient"],
  { revalidate: 3600 },
)

export type RemovedGrant = Awaited<ReturnType<typeof getRemovedGrants>>[number]
