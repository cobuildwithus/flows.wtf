"use client"

import { superTokenAbi } from "@/lib/abis"
import { useContractTransaction } from "@/lib/wagmi/use-contract-transaction"

export const useUpgradeToken = (args: {
  chainId: number
  superTokenAddress: `0x${string}`
  onSuccess?: (hash: string) => void
}) => {
  const { chainId, superTokenAddress, onSuccess } = args

  const { prepareWallet, writeContract, isLoading, isSuccess, isError, error } =
    useContractTransaction({
      chainId,
      loading: "Upgrading tokens...",
      success: "Tokens upgraded successfully",
      onSuccess,
    })

  const upgrade = async (amount: bigint) => {
    await prepareWallet()

    writeContract({
      address: superTokenAddress,
      abi: superTokenAbi,
      functionName: "upgrade",
      args: [amount],
      chainId,
    })
  }

  return {
    upgrade,
    isLoading,
    isSuccess,
    isError,
    error,
  }
}
