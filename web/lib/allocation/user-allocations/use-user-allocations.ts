"use client"

import useSWR from "swr"
import { useAccount } from "wagmi"
import { useDelegatedTokens } from "../delegated-tokens/use-delegated-tokens"
import { getAllocationsByKey } from "./get-allocations-by-key"

export function useUserAllocations(contract: `0x${string}`) {
  const { address } = useAccount()
  const { tokens } = useDelegatedTokens(address as `0x${string}`)

  const tokenIds = tokens.map(({ tokenId }) => tokenId.toString())

  const {
    data: tokenVotes,
    mutate,
    isLoading,
  } = useSWR(tokens.length > 0 ? `${contract}_${tokenIds}` : null, () =>
    getAllocationsByKey(contract, tokenIds),
  )

  return {
    allocations: tokenVotes,
    mutate,
    isLoading,
  }
}
