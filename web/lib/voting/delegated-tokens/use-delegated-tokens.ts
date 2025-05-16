"use client"

import useSWR from "swr"
import { fetchDelegatedTokens } from "./get-delegated-tokens"
import { useParams } from "next/navigation"
import { NOUNS_FLOW } from "@/lib/config"

export function useDelegatedTokens(address: `0x${string}` | undefined) {
  const { flowId = NOUNS_FLOW } = useParams<{ flowId: string }>()

  const { data, ...rest } = useSWR(
    address,
    (address) => fetchDelegatedTokens(address.toLowerCase(), flowId),
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
