"use client"

import { nounsFlowImplAbi } from "@/lib/abis"
import { useReadContract } from "wagmi"

export function useBaselinePoolFlowRatePercent(address: `0x${string}`) {
  const { data: baselinePoolFlowRatePercent } = useReadContract({
    address,
    abi: nounsFlowImplAbi,
    functionName: "baselinePoolFlowRatePercent",
  })

  return baselinePoolFlowRatePercent
}
