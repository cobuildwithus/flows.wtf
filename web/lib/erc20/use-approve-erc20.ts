"use client"

import { erc20Abi } from "viem"
import { useContractTransaction } from "@/lib/wagmi/use-contract-transaction"
import { getClient } from "@/lib/viem/client"

export const useApproveErc20 = (args: {
  chainId: number
  tokenAddress: `0x${string}`
  spenderAddress: `0x${string}`
  onSuccess?: (hash: string) => void
}) => {
  const { chainId, tokenAddress, spenderAddress, onSuccess } = args

  const { prepareWallet, writeContractAsync, isLoading, isSuccess, isError, error } =
    useContractTransaction({
      chainId,
      loading: "Approving token spend...",
      success: "Token approval confirmed",
      onSuccess,
    })

  const approve = async (amount: bigint) => {
    await prepareWallet()

    const hash = await writeContractAsync({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: "approve",
      args: [spenderAddress, amount],
      chainId,
    })

    const client = getClient(chainId)

    await client.waitForTransactionReceipt({
      hash,
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
