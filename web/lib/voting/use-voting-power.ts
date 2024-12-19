"use client"

import useSWR from "swr"
import { useAccount } from "wagmi"
import { getVotingPower } from "./get-voting-power"

export function useVotingPower() {
  const { address } = useAccount()

  const { data: votingPower, isLoading } = useSWR(address ? ["voting-power", address] : null, () =>
    getVotingPower(address),
  )

  return {
    votingPower: BigInt(votingPower ?? "0"),
    isLoading,
  }
}
