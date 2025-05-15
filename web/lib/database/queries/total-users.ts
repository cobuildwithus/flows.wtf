"use server"

import database from "@/lib/database/edge"

export async function countFlowTotalUsers(flowId: string, tokenContract: `0x${string}`) {
  const curators = await database.tokenHolder.findMany({
    where: {
      tokenContract,
    },
    select: {
      holder: true,
    },
  })
  console.log("curators", curators)

  const voters = await database.vote.findMany({
    where: {
      grant: {
        flowId,
      },
    },
    select: {
      voter: true,
    },
  })
  console.log("voters", voters)

  const recipients = await database.grant.findMany({
    where: {
      flowId,
    },
    select: {
      recipient: true,
    },
  })

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
}
