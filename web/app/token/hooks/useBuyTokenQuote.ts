"use client"

import type { Address } from "viem"
import { base } from "viem/chains"
import useSWR from "swr"
import { getTokenQuote, getTokenQuoteWithRewards } from "./buy-token-quotes"

export function useBuyTokenQuote(contract: Address, amount: bigint, chainId: number) {
  const { data, error, isLoading } = useSWR(["buyTokenQuote", contract, amount, chainId], () =>
    getTokenQuote(contract, amount, chainId),
  )

  return {
    totalCost: data?.totalCost || 0,
    addedSurgeCost: data?.addedSurgeCost || 0,
    isError: error || data?.isError || false,
    isLoading,
  }
}

export function useBuyTokenQuoteWithRewards(contract: Address, amount: bigint, chainId: number) {
  const { data, error, isLoading } = useSWR(
    ["buyTokenQuoteWithRewards", contract, amount, chainId],
    () => getTokenQuoteWithRewards(contract, amount, chainId),
  )

  return {
    totalCost: data?.totalCost || 0,
    addedSurgeCost: data?.addedSurgeCost || 0,
    isError: error || data?.isError || false,
    isLoading,
    error,
  }
}
