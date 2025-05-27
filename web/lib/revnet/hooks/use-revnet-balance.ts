"use client"

import { useServerFunction } from "@/lib/hooks/use-server-function"
import { getRevnetBalance } from "./get-revnet-balance"

export function useRevnetBalance(projectId: bigint, chainId: number) {
  return useServerFunction(getRevnetBalance, "revnet-balance", [projectId, chainId], {
    refreshInterval: 30000, // Refresh every 30 seconds
    revalidateOnFocus: false,
  })
}
