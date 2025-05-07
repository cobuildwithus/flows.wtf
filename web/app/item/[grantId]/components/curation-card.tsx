import "server-only"

import { DisputeUserVote } from "@/app/components/dispute/dispute-user-vote"
import database from "@/lib/database/edge"
import type { Grant } from "@prisma/flows"
import { StatusDisputed } from "./status-disputed"
import { StatusNotDisputed } from "./status-not-disputed"
import { getUser } from "@/lib/auth/user"

interface Props {
  grant: Grant
  flow: Grant
}

export async function CurationStatus(props: Props) {
  const { grant, flow } = props

  if (!grant.isDisputed) return <StatusNotDisputed grant={grant} flow={flow} />

  const dispute = await getDispute(grant.id)
  if (!dispute) return null

  return <StatusDisputed grant={grant} flow={flow} dispute={dispute} />
}

export async function CurationVote(props: { grant: Grant }) {
  const { grant } = props
  if (!grant.isDisputed) return null

  const [dispute, user] = await Promise.all([getDispute(grant.id), getUser()])
  if (!dispute) return null

  return <DisputeUserVote user={user} grant={grant} dispute={dispute} />
}

async function getDispute(grantId: string) {
  return await database.dispute.findFirst({
    where: { grantId },
    orderBy: { creationBlock: "desc" },
    include: { evidences: true },
  })
}
