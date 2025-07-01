"use client"

import useSWR from "swr"
import { getActualFlowRate } from "./get-actual-flow-rate"

export function useActualFlowRate(contractAddress: `0x${string}`, chainId: number) {
  const {
    data: actualFlowRate,
    error,
    isLoading,
    mutate: refetch,
  } = useSWR<bigint>(contractAddress ? ["actual-flow-rate", contractAddress, chainId] : null, () =>
    getActualFlowRate(contractAddress, chainId),
  )

  return {
    actualFlowRate: actualFlowRate ?? 0n,
    error,
    isLoading,
    refetch,
  }
}
