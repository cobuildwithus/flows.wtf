"use client"

import type { Address } from "viem"
import { base } from "viem/chains"
import useSWR from "swr"
import { getSellTokenQuote } from "./sell-token-quotes"

export function useSellTokenQuote(contract: Address, amount: bigint, chainId = base.id) {
  const { data, error, isLoading } = useSWR(["sellTokenQuote", contract, amount, chainId], () =>
    getSellTokenQuote(contract, amount, chainId),
  )

  return {
    payment: data?.payment || 0,
    isError: error || data?.isError || false,
    isLoading,
  }
}
