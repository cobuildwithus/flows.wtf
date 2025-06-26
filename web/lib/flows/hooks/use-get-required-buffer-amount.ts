"use client"

import { customFlowImplAbi } from "@/lib/abis"
import { useReadContract } from "wagmi"

interface UseGetRequiredBufferAmountProps {
  contract: `0x${string}`
  chainId: number
  amount: bigint
}

export function useGetRequiredBufferAmount({
  contract,
  chainId,
  amount,
}: UseGetRequiredBufferAmountProps) {
  const {
    data: requiredBufferAmount,
    isLoading,
    error,
    refetch,
  } = useReadContract({
    address: contract,
    abi: customFlowImplAbi,
    functionName: "getRequiredBufferAmount",
    args: [amount],
    chainId,
    query: {
      enabled: !!contract && !!amount && amount > 0n,
    },
  })

  return {
    requiredBufferAmount: requiredBufferAmount as bigint | undefined,
    isLoading,
    error,
    refetch,
  }
}
