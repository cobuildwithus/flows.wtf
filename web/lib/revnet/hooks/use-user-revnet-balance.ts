"use client"

import { useServerFunction } from "@/lib/hooks/use-server-function"
import { getUserRevnetBalance } from "./get-user-revnet-balance"

export function useUserRevnetBalance(
  projectId: bigint,
  chainId: number,
  userAddress: string | undefined,
) {
  return useServerFunction(
    getUserRevnetBalance,
    userAddress ? `user-revnet-balance-${userAddress}` : undefined,
    [projectId, chainId, userAddress || ""] as [bigint, number, string],
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: false,
    },
  )
}
