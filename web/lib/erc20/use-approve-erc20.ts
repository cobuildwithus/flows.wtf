"use client"

import { erc20Abi } from "viem"
import { useContractTransaction } from "@/lib/wagmi/use-contract-transaction"

export const useApproveErc20 = (args: {
  chainId: number
  tokenAddress: `0x${string}`
  spenderAddress: `0x${string}`
  onSuccess?: (hash: string) => void
}) => {
  const { chainId, tokenAddress, spenderAddress, onSuccess } = args

  const { prepareWallet, writeContract, isLoading, isSuccess, isError, error } =
    useContractTransaction({
      chainId,
      loading: "Approving token spend...",
      success: "Token approval confirmed",
      onSuccess,
    })

  const approve = async (amount: bigint) => {
    await prepareWallet()

    writeContract({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: "approve",
      args: [spenderAddress, amount],
      chainId,
    })
  }

  return {
    approve,
    isLoading,
    isSuccess,
    isError,
    error,
  }
}
