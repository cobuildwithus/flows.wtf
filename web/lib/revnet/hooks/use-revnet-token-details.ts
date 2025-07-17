"use client"

import { useServerFunction } from "@/lib/hooks/use-server-function"
import { getRevnetTokenDetails } from "./get-revnet-token-details"

export function useRevnetTokenDetails(projectId: number, chainId: number) {
  return useServerFunction(
    getRevnetTokenDetails,
    `revnet-token-details-${projectId}-${chainId}`,
    [BigInt(projectId), chainId],
    {
      refreshInterval: 0, // Token details don't change often
      revalidateOnFocus: false,
    },
  )
}
