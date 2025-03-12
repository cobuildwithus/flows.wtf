"use client"

import useSWR from "swr"
import type { Address } from "viem"
import { getClaimablePoolBalance } from "./get-claimable-pool-balance"

export const useClaimablePoolBalance = (pool: Address | undefined, user: Address | undefined) => {
  const {
    data: balance,
    isLoading,
    mutate: refetch,
  } = useSWR(pool && user ? ["claimable-pool-balance", pool, user] : null, () =>
    pool && user ? getClaimablePoolBalance(pool, user) : Promise.resolve(BigInt(0)),
  )

  return {
    balance: balance || BigInt(0),
    isLoading,
    refetch,
  }
}
