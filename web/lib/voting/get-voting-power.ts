"use server"

import { NOUNS_TOKEN, VOTING_POWER_SCALE } from "@/lib/config"
import { nounsTokenAbi } from "../abis"
import { l1Client } from "@/lib/viem/client"
import { getEthAddress } from "@/lib/utils"
import { unstable_cache } from "next/cache"
import { Address } from "viem"

export const getVotingPower = unstable_cache(
  async (address: string | undefined) => {
    if (!address) return "0"

    try {
      const votingPower = await l1Client.readContract({
        address: NOUNS_TOKEN as Address,
        abi: nounsTokenAbi,
        functionName: "getCurrentVotes",
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
