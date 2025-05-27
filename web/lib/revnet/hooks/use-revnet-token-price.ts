"use client"

import { useServerFunction } from "@/lib/hooks/use-server-function"
import { getRevnetTokenPrice } from "./get-revnet-token-price"

export function useRevnetTokenPrice(projectId: bigint, chainId: number) {
  return useServerFunction(getRevnetTokenPrice, "revnet-token-price", [projectId, chainId], {
    refreshInterval: 30000, // Refresh every 30 seconds
    revalidateOnFocus: false,
  })
}
