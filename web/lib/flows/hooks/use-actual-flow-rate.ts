"use client"

import { customFlowImplAbi } from "@/lib/abis"
import { useReadContract } from "wagmi"

export function useActualFlowRate(contractAddress: `0x${string}`, chainId: number) {
  // getActualFlowRate() returns int96, which wagmi/viem will decode as bigint
  const { data, error, isLoading } = useReadContract({
    address: contractAddress,
    abi: customFlowImplAbi,
    functionName: "getActualFlowRate",
    chainId,
  })

  return {
    actualFlowRate: data ?? 0n,
    error,
    isLoading,
  }
}
