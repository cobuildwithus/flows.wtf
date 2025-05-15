"use server"

import { NOUNS_TOKEN, VOTING_POWER_SCALE } from "@/lib/config"
import { nounsTokenAbi } from "../abis"
import { VotesAbi } from "../abis/votes-abi"
import { getClient } from "@/lib/viem/client"
import { getEthAddress } from "@/lib/utils"
import { unstable_cache } from "next/cache"
import { Address } from "viem"
import database from "../database/edge"
import { mainnet } from "viem/chains"

export const getVotingPower = unstable_cache(
  async (address: string | undefined, flowId: string | null) => {
    if (!address) return "0"

    const tokenRecord = flowId
      ? await database.grant.findUnique({
          where: { id: flowId },
          select: { erc721VotingToken: true, votingTokenChainId: true },
        })
      : null

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
        return ((votingPower ?? BigInt(0)) * VOTING_POWER_SCALE).toString()
      }

      // Standard Votes token pathway
      const votingPower = await client.readContract({
        address: getEthAddress(erc721VotingToken) as Address,
        abi: VotesAbi,
        functionName: "getVotes",
        args: [getEthAddress(address) as Address],
      })
      return ((votingPower ?? BigInt(0)) * VOTING_POWER_SCALE).toString()
    } catch (error) {
      console.error("Error getting voting power:", error)
      return "0"
    }
  },
  ["voting-power"],
  { revalidate: 600 }, // 10 minutes in seconds
)
