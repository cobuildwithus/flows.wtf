"use client"

import type { Address } from "viem"
import { useServerFunction } from "@/lib/hooks/use-server-function"
import { getSellTokenQuote } from "./sell-token-quotes"

export function useSellTokenQuote(contract: Address, amount: bigint, chainId: number) {
  const { data, error, isLoading } = useServerFunction(
    getSellTokenQuote,
    "sell-token-quote",
    [contract, Number(amount), chainId],
    { fallbackData: { payment: 0, isError: false } },
  )

  return {
    payment: data?.payment || 0,
    isError: error || data?.isError || false,
    isLoading,
  }
}
