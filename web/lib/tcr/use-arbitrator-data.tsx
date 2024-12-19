"use client"

import { Address } from "viem"
import { base } from "viem/chains"
import { useAccount, useReadContract } from "wagmi"
import { erc20VotesArbitratorImplAbi } from "../abis"

export function useArbitratorData(contract: Address, disputeId: string, chainId = base.id) {
  const { address: owner } = useAccount()

  const { data: votingPower } = useReadContract({
    abi: erc20VotesArbitratorImplAbi,
    address: contract,
    chainId,
    functionName: "votingPowerInCurrentRound",
    args: [BigInt(disputeId), owner as Address],
  })

  return {
    votingPower: votingPower?.[0] || BigInt(0),
    canVote: votingPower?.[1] || false,
  }
}
