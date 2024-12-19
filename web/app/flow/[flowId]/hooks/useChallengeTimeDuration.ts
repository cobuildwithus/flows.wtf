"use client"

import { flowTcrImplAbi } from "@/lib/abis"
import { useReadContract } from "wagmi"

export function useChallengeTimeDuration(address: `0x${string}`) {
  const { data: duration } = useReadContract({
    address,
    abi: flowTcrImplAbi,
    functionName: "challengePeriodDuration",
  })

  return duration
}
