"use client"

import type { Address } from "viem"
import { getVotingPower } from "./get-arbitrator-voting-power"
import { useServerFunction } from "@/lib/hooks/use-server-function"

export function useArbitratorData(
  contract: Address,
  disputeId: string,
  chainId: number,
  address?: Address,
) {
  const {
    data: votingPowerData,
    isLoading,
    mutate: refetch,
  } = useServerFunction(getVotingPower, "voting-power", [contract, disputeId, chainId, address], {
    fallbackData: {
      votingPower: BigInt(0),
      canVote: false,
    },
  })

  return {
    votingPower: votingPowerData?.votingPower || BigInt(0),
    canVote: votingPowerData?.canVote || false,
    isLoading,
    refetch,
  }
}
