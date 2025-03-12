"use client"

import type { Address } from "viem"
import { getERC20Supply } from "./get-erc20-supply"
import { useServerFunction } from "@/lib/hooks/use-server-function"

export function useERC20Supply(contract: Address | undefined) {
  const {
    data: totalSupply,
    isLoading,
    mutate: refetch,
  } = useServerFunction(getERC20Supply, "erc20-total-supply", [contract], {
    fallbackData: 0,
  })

  return {
    totalSupply: totalSupply || 0,
    isLoading,
    refetch,
  }
}
