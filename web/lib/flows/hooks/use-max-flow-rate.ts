"use client"

import useSWR from "swr"
import { getMaxSafeFlowRate } from "./get-max-safe-flow-rate"

export function useMaxSafeFlowRate(contractAddress: `0x${string}`, chainId: number) {
  const {
    data: maxSafeFlowRate,
    error,
    isLoading,
    mutate: refetch,
  } = useSWR<bigint>(
    contractAddress ? ["max-safe-flow-rate", contractAddress, chainId] : null,
    () => getMaxSafeFlowRate(contractAddress, chainId),
  )

  return {
    maxSafeFlowRate: maxSafeFlowRate ?? 0n,
    error,
    isLoading,
    refetch,
  }
}
