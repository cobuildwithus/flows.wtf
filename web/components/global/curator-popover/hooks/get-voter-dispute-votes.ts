"use server"

import database from "@/lib/database/edge"
import { cache } from "react"

export const getVoterDisputeVotes = cache(async (address: `0x${string}`) => {
  if (!address) return []

  const votes = await database.disputeVote.findMany({
    where: { voter: address },
    select: {
      arbitrator: true,
      choice: true,
      disputeId: true,
      votes: true,
    },
  })

  return votes
})
