"use server"

import type { Address } from "viem"
import { getClient } from "@/lib/viem/client"
import { erc20VotesArbitratorImplAbi } from "../abis"

export async function getVotingPower(
  contract: Address,
  disputeId: string,
  chainId: number,
  address?: Address,
) {
  if (!contract || !address) {
    return {
      votingPower: BigInt(0),
      canVote: false,
    }
  }

  try {
    const votingPower = await getClient(chainId).readContract({
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
