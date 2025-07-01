"use client"

import useSWR from "swr"
import { getFlowRateTooHigh } from "./get-flow-rate-too-high"

export function useFlowRateTooHigh(flowId: `0x${string}`, chainId: number) {
  const {
    data: isFlowRateTooHigh,
    error,
    isLoading,
    mutate: refetch,
  } = useSWR<boolean>(flowId ? ["flow-rate-too-high", flowId, chainId] : null, () =>
    getFlowRateTooHigh(flowId, chainId),
  )

  return {
    isFlowRateTooHigh: isFlowRateTooHigh ?? false,
    error,
    isLoading,
    refetch,
  }
}
