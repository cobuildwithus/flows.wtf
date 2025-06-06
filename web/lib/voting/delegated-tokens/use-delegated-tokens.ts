"use client"

import useSWR from "swr"
import { useFlowId } from "../hooks/use-flow-id"
import { fetchDelegatedTokens } from "./get-delegated-tokens"

export function useDelegatedTokens(address: `0x${string}` | undefined) {
  const flowId = useFlowId()

  const { data, ...rest } = useSWR(
    address && flowId ? [address, flowId] : null,
    ([address, flowId]) => fetchDelegatedTokens(address.toLowerCase(), flowId),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  )

  return {
    tokens: data?.map(({ tokenId, owner, contract }) => ({ tokenId, owner, contract })) || [],
    ...rest,
  }
}
