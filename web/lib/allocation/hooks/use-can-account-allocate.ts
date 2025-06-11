"use client"

import useSWR from "swr"
import { canAllocate } from "../allocation-data/can-allocate"

export const useCanAccountAllocate = (
  strategies: string[],
  chainId: number,
  account: string | null,
) => {
  console.log("useCanAccountAllocate", strategies, chainId, account)

  const {
    data: canAccountAllocate,
    isLoading,
    error,
  } = useSWR(
    account && strategies.length > 0 ? ["canAllocate", account, strategies, chainId] : null,
    () => canAllocate(strategies, chainId, account),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    },
  )

  return {
    canAccountAllocate: canAccountAllocate ?? false,
    isLoading,
    error,
  }
}
