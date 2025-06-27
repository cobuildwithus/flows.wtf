"use client"

import { customFlowImplAbi } from "@/lib/abis"
import { useContractTransaction } from "@/lib/wagmi/use-contract-transaction"

interface UseDecreaseFlowRateProps {
  contract: `0x${string}`
  chainId: number
  onSuccess?: (hash: string) => void
}

export function useDecreaseFlowRate({ contract, chainId, onSuccess }: UseDecreaseFlowRateProps) {
  const {
    writeContract,
    isPending,
    isConfirming,
    isConfirmed,
    isLoading,
    hash,
    error,
    prepareWallet,
  } = useContractTransaction({
    chainId,
    onSuccess,
    loading: "Decreasing flow rate...",
    success: "Flow rate decreased successfully",
  })

  const decreaseFlowRate = async () => {
    await prepareWallet()

    writeContract({
      address: contract,
      abi: customFlowImplAbi,
      functionName: "decreaseFlowRate",
      args: [],
    })
  }

  return {
    decreaseFlowRate,
    isPending,
    isConfirming,
    isConfirmed,
    isLoading,
    hash,
    error,
  }
}
