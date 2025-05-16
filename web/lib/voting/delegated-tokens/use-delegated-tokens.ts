"use client"

import useSWR from "swr"
import { fetchDelegatedTokens } from "./get-delegated-tokens"
import { useParams } from "next/navigation"

export function useDelegatedTokens(address: `0x${string}` | undefined) {
  const { flowId } = useParams<{ flowId: string }>()

  const { data, ...rest } = useSWR(
    address,
    (address) => fetchDelegatedTokens(address.toLowerCase(), flowId),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  )

  return {
    tokens: data?.map(({ id, owner }) => ({ id: BigInt(id), owner })) || [],
    ...rest,
  }
}
