"use client"

import type { Address } from "viem"
import { getClaimablePoolBalance } from "./get-claimable-pool-balance"
import { useServerFunction } from "@/lib/hooks/use-server-function"

export const useClaimablePoolBalance = (
  pool: Address | undefined,
  user: Address | undefined,
  chainId: number,
) => {
  const {
    data: balance,
    isLoading,
    mutate: refetch,
  } = useServerFunction(getClaimablePoolBalance, "claimable-pool-balance", [pool, user, chainId], {
    fallbackData: BigInt(0),
  })

  return {
    balance: balance || BigInt(0),
    isLoading,
    refetch,
  }
}
