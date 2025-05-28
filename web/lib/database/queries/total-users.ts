"use server"

import database from "@/lib/database/flows-db"
import { unstable_cache } from "next/cache"

export const getTotalUsers = async (
  flowId: string,
  isTopLevel: boolean,
  tokenContract: `0x${string}` | null,
) => {
  if (isTopLevel) {
    return await countTotalUsers()
  }
  if (tokenContract) {
    return await countFlowTotalUsers(flowId, tokenContract)
  }

  return null
}

const countFlowTotalUsers = unstable_cache(
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

    const curatorAddresses = extractValues(curators, "holder")
    const voterAddresses = extractValues(voters, "voter")
    const recipientAddresses = extractValues(recipients, "recipient")

    const numCurators = countUnique(curatorAddresses)
    const numVoters = countUnique(voterAddresses)
    const numRecipients = countUnique(recipientAddresses)

    const uniqueUsers = Array.from(
      new Set([...curatorAddresses, ...voterAddresses, ...recipientAddresses]),
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

const countTotalUsers = unstable_cache(
  async () => {
    const [curators, voters, recipients] = await Promise.all([
      database.tokenHolder.findMany({
        select: {
          holder: true,
        },
      }),
      database.vote.findMany({
        select: {
          voter: true,
        },
      }),
      database.grant.findMany({
        where: {
          isFlow: false,
        },
        select: {
          recipient: true,
        },
      }),
    ])

    const curatorAddresses = extractValues(curators, "holder")
    const voterAddresses = extractValues(voters, "voter")
    const recipientAddresses = extractValues(recipients, "recipient")

    const numCurators = countUnique(curatorAddresses)
    const numVoters = countUnique(voterAddresses)
    const numRecipients = countUnique(recipientAddresses)

    const uniqueUsers = Array.from(
      new Set([...curatorAddresses, ...voterAddresses, ...recipientAddresses]),
    )

    return {
      uniqueUsers: uniqueUsers.length,
      numCurators,
      numVoters,
      numRecipients,
    }
  },
  ["total-users"],
  { revalidate: 3600 },
)

// Helper function to count unique items in an array
const countUnique = (items: string[]): number => {
  return Array.from(new Set(items)).length
}

// Helper function to extract values from objects
const extractValues = <T, K extends keyof T>(items: T[], key: K): T[K][] => {
  return items.map((item) => item[key])
}
