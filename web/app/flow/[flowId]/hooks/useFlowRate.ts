"use client"

import { nounsFlowImplAbi } from "@/lib/abis"
import { useReadContract } from "wagmi"

export function useFlowRate(address: `0x${string}`) {
  const { data: flowRate } = useReadContract({
    address,
    abi: nounsFlowImplAbi,
    functionName: "getTotalFlowRate",
  })

  return flowRate
}
