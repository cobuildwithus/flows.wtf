"use server"

import { NOUNS_TOKEN, VOTING_POWER_SCALE } from "@/lib/config"
import { nounsTokenAbi } from "../../abis"
import { getClient } from "@/lib/viem/client"
import { getEthAddress } from "@/lib/utils"
import { Address } from "viem"
import database from "../../database/flows-db"
import { mainnet } from "viem/chains"
import { getAccountAllocationWeight } from "./account-allocation-weight"

export const getAllocationPower = async (address: string | undefined, flowId: string | null) => {
  if (!address) return 0

  const tokenRecord = flowId
    ? await database.grant.findUnique({
        where: { id: flowId },
        select: {
          erc721VotingToken: true,
          votingTokenChainId: true,
          allocationStrategies: true,
          chainId: true,
        },
      })
    : null

  if (tokenRecord?.allocationStrategies) {
    const allocationWeight = await getAccountAllocationWeight(
      tokenRecord.allocationStrategies,
      tokenRecord.chainId,
      address,
    )

    return allocationWeight
  }

  // default to nouns token voting on homepage
  const erc721VotingToken = tokenRecord?.erc721VotingToken ?? NOUNS_TOKEN
  const votingTokenChainId = tokenRecord?.votingTokenChainId ?? mainnet.id

  const client = getClient(votingTokenChainId)
  const isNounsToken = erc721VotingToken === NOUNS_TOKEN

  try {
    if (isNounsToken) {
      // Nouns token pathway
      const votingPower = await client.readContract({
        address: getEthAddress(erc721VotingToken) as Address,
        abi: nounsTokenAbi,
        functionName: "getCurrentVotes",
        args: [getEthAddress(address) as Address],
      })
      return Number(votingPower ?? 0) * Number(VOTING_POWER_SCALE)
    }
  } catch (error) {
    console.error("Error getting voting power:", error)
    return 0
  }
}
