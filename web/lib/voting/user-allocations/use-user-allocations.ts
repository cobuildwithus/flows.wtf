"use client"

import useSWR from "swr"
import { useDelegatedTokens } from "../delegated-tokens/use-delegated-tokens"
import { getTokenVotes } from "./get-token-votes"
import { getMemberUnitsAllocations } from "./get-member-units-allocations"
import { useAccount } from "wagmi"

export function useUserAllocations(contract: `0x${string}`) {
  const { address } = useAccount()

  const { tokens } = useDelegatedTokens(address as `0x${string}`)

  const tokenIds = tokens.map(({ tokenId }) => tokenId.toString())

  const { data: tokenVotes, ...tokenVotesRest } = useSWR(
    tokens.length > 0 ? `${contract}_${tokenIds}` : null,
    () => getTokenVotes(contract, tokenIds),
  )

  const { data: memberUnitsAllocations, ...memberUnitsAllocationsRest } = useSWR(
    address ? `${contract}_${address}` : null,
    () => getMemberUnitsAllocations(contract, address as `0x${string}`),
  )

  const mutate = () => {
    tokenVotesRest.mutate()
    memberUnitsAllocationsRest.mutate()
  }

  const isLoading = tokenVotesRest.isLoading || memberUnitsAllocationsRest.isLoading

  const allocations = [...(tokenVotes || []), ...(memberUnitsAllocations || [])]

  return {
    allocations,
    mutate,
    isLoading,
  }
}
