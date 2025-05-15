"use server"

import database from "@/lib/database/edge"
import { unstable_cache } from "next/cache"

export const countFlowTotalUsers = unstable_cache(
  async (flowId: string, tokenContract: `0x${string}`) => {
    const [curators, voters, recipients] = await Promise.all([
      database.tokenHolder.findMany({
        where: {
          tokenContract,
        },
        select: {
          holder: true,
        },
      }),
      database.vote.findMany({
        where: {
          grant: {
            flowId,
          },
        },
        select: {
          voter: true,
        },
      }),
      database.grant.findMany({
        where: {
          flowId,
        },
        select: {
          recipient: true,
        },
      }),
    ])

    const numCurators = Array.from(new Set(curators.map((c) => c.holder))).length
    const numVoters = Array.from(new Set(voters.map((v) => v.voter))).length
    const numRecipients = Array.from(new Set(recipients.map((r) => r.recipient))).length

    const uniqueUsers = Array.from(
      new Set([
        ...curators.map((c) => c.holder),
        ...voters.map((v) => v.voter),
        ...recipients.map((r) => r.recipient),
      ]),
    )

    return {
      uniqueUsers: uniqueUsers.length,
      numCurators,
      numVoters,
      numRecipients,
    }
  },
  ["flow-total-users"],
  { revalidate: 3600 },
)
