"use client"

import { tokenEmitterImplAbi } from "@/lib/abis"
import { Address } from "viem"
import { base } from "viem/chains"
import { useReadContract } from "wagmi"

export function useBuyTokenQuote(contract: Address, amount: bigint, chainId = base.id) {
  const { data, isError, isLoading } = useReadContract({
    abi: tokenEmitterImplAbi,
    address: contract,
    chainId,
    functionName: "buyTokenQuote",
    args: [amount],
  })

  return {
    totalCost: data?.[0] || BigInt(0),
    addedSurgeCost: data?.[1] || BigInt(0),
    isError,
    isLoading,
  }
}

export function useBuyTokenQuoteWithRewards(contract: Address, amount: bigint, chainId = base.id) {
  const { data, isError, isLoading } = useReadContract({
    abi: tokenEmitterImplAbi,
    address: contract,
    chainId,
    functionName: "buyTokenQuoteWithRewards",
    args: [amount],
  })

  return {
    totalCost: data?.[0] || BigInt(0),
    addedSurgeCost: data?.[1] || BigInt(0),
    isError,
    isLoading,
  }
}
