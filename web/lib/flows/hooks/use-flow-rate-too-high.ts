"use client"

import { customFlowImplAbi } from "@/lib/abis"
import { useReadContract } from "wagmi"

export function useFlowRateTooHigh(flowId: `0x${string}`, chainId: number) {
  // Returns { data, error, isLoading } for isFlowRateTooHigh
  const { data, error, isLoading } = useReadContract({
    address: flowId,
    abi: customFlowImplAbi,
    functionName: "isFlowRateTooHigh",
    chainId,
  })

  return {
    isFlowRateTooHigh: data ?? false,
    error,
    isLoading,
  }
}
