"use client"

import useSWR from "swr"
import { useAccount } from "wagmi"
import { getVotingPower } from "../voting-power/get-voting-power"
import { useFlow } from "./use-flow"

export function useVotingPower() {
  const { flowId } = useFlow()

  const { address } = useAccount()

  const { data: votingPower, isLoading } = useSWR(address ? ["voting-power", address] : null, () =>
    getVotingPower(address, flowId),
  )

  return {
    votingPower: BigInt(votingPower ?? "0"),
    isLoading,
  }
}
