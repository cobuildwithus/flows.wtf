"use server"

import database from "@/lib/database/edge"

export async function getDisputeVote(disputeId: string, voter: string, arbitrator: string) {
  const disputeVote = await database.disputeVote.findFirst({
    where: {
      disputeId,
      arbitrator: arbitrator.toLowerCase(),
      voter: voter.toLowerCase(),
    },
  })

  return disputeVote
}
