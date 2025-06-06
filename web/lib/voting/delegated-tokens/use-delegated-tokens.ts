"use client"

import useSWR from "swr"
import { fetchDelegatedTokens } from "./get-delegated-tokens"
import { useParams, usePathname } from "next/navigation"
import { NOUNS_FLOW } from "@/lib/config"

export function useDelegatedTokens(address: `0x${string}` | undefined) {
  const { flowId: paramsFlowId } = useParams<{ flowId: string }>()
  const pathname = usePathname()

  const flowId = getFlowIdFromPath(pathname, paramsFlowId)

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

const GROUNDS_FLOW_ID = "0xca1d9e8a93f316ef7e6f880116a160333d085f92"
const VRBS_FLOW_ID = "0xca1d9e8a93f316ef7e6f880116a160333d085f92"

function getFlowIdFromPath(pathname: string, paramsFlowId?: string): string {
  if (pathname === "/grounds") {
    return GROUNDS_FLOW_ID
  }
  if (pathname === "/vrbs") {
    return VRBS_FLOW_ID
  }

  return paramsFlowId || NOUNS_FLOW
}
