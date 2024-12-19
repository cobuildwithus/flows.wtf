"use client"

import { tokenEmitterImplAbi } from "@/lib/abis"
import { Address } from "viem"
import { base } from "viem/chains"
import { useReadContract } from "wagmi"

export function useSellTokenQuote(contract: Address, amount: bigint, chainId = base.id) {
  const { data, isError, isLoading } = useReadContract({
    abi: tokenEmitterImplAbi,
    address: contract,
    chainId,
    functionName: "sellTokenQuote",
    args: [amount],
  })

  return {
    payment: data || BigInt(0),
    isError,
    isLoading,
  }
}
