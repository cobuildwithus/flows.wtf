"use server"

import type { Address } from "viem"
import { l2Client } from "@/lib/viem/client"
import { erc20VotesArbitratorImplAbi } from "../abis"

export async function getVotingPower(contract: Address, disputeId: string, address?: Address) {
  if (!contract || !address) {
    return {
      votingPower: BigInt(0),
      canVote: false,
    }
  }

  try {
    const votingPower = await l2Client.readContract({
      abi: erc20VotesArbitratorImplAbi,
      address: contract,
      functionName: "votingPowerInCurrentRound",
      args: [BigInt(disputeId), address],
    })

    return {
      votingPower: votingPower[0] || BigInt(0),
      canVote: votingPower[1] || false,
    }
  } catch (error) {
    console.error("Error getting voting power:", error)
    return {
      votingPower: BigInt(0),
      canVote: false,
    }
  }
}
