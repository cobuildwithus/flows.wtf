"use client"

import useSWR from "swr"
import { useAccount } from "wagmi"
import { useDelegatedTokens } from "../delegated-tokens/use-delegated-tokens"
import { getTokenVotes } from "./get-token-votes"

export function useUserAllocations(contract: `0x${string}`) {
  const { address } = useAccount()
  const { tokens } = useDelegatedTokens(address as `0x${string}`)

  const tokenIds = tokens.map(({ tokenId }) => tokenId.toString())

  const {
    data: tokenVotes,
    mutate,
    isLoading,
  } = useSWR(tokens.length > 0 ? `${contract}_${tokenIds}` : null, () =>
    getTokenVotes(contract, tokenIds),
  )

  return {
    allocations: tokenVotes || [],
    mutate,
    isLoading,
  }
}
