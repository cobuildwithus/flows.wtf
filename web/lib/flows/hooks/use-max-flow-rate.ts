"use client"

import { customFlowImplAbi } from "@/lib/abis"
import { useReadContract } from "wagmi"

export function useMaxSafeFlowRate(contractAddress: `0x${string}`, chainId: number) {
  const { data, error, isLoading } = useReadContract({
    address: contractAddress,
    abi: customFlowImplAbi,
    functionName: "getMaxSafeFlowRate",
    chainId,
  })

  return {
    actualFlowRate: data ?? 0n,
    error,
    isLoading,
  }
}
