"use client"

import useSWR from "swr"
import type { Address } from "viem"
import { getERC20Supply } from "./get-erc20-supply"

export function useERC20Supply(contract: Address | undefined) {
  const {
    data: totalSupply,
    isLoading,
    mutate,
  } = useSWR(contract ? ["erc20-total-supply", contract] : null, () =>
    contract ? getERC20Supply(contract) : Promise.resolve(0),
  )

  return {
    totalSupply: totalSupply || 0,
    isLoading,
    refetch: mutate,
  }
}
