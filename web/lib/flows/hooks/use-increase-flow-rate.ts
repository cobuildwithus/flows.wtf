"use client"

import { customFlowImplAbi } from "@/lib/abis"
import { useContractTransaction } from "@/lib/wagmi/use-contract-transaction"
import { useERC20Allowance } from "@/lib/erc20/use-erc20-allowance"
import { useApproveErc20 } from "@/lib/erc20/use-approve-erc20"
import { useGetRequiredBufferAmount } from "./use-get-required-buffer-amount"
import { useState } from "react"

interface UseIncreaseFlowRateProps {
  contract: `0x${string}`
  chainId: number
  superToken: `0x${string}`
  userAddress: `0x${string}` | undefined
  onSuccess?: (hash: string) => void
}

export function useIncreaseFlowRate({
  contract,
  chainId,
  superToken,
  userAddress,
  onSuccess,
}: UseIncreaseFlowRateProps) {
  const [isApproving, setIsApproving] = useState(false)
  const [pendingAmount, setPendingAmount] = useState<bigint>(0n)

  const { requiredBufferAmount } = useGetRequiredBufferAmount({
    contract,
    chainId,
    amount: pendingAmount,
  })

  const { allowance, refetch: refetchAllowance } = useERC20Allowance(
    superToken,
    userAddress,
    contract,
    chainId,
  )

  const { approve } = useApproveErc20({
    chainId,
    tokenAddress: superToken,
    spenderAddress: contract,
    onSuccess: () => {
      setIsApproving(false)
      refetchAllowance()
    },
  })

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
    loading: "Increasing flow rate...",
    success: "Flow rate increased successfully",
  })

  const increaseFlowRate = async (amount: bigint) => {
    if (!userAddress) return

    setPendingAmount(amount)

    // Wait for required buffer amount to be calculated
    const bufferAmount = requiredBufferAmount || amount

    // Check if approval is needed for the buffer amount
    if (allowance < bufferAmount) {
      setIsApproving(true)
      await approve(bufferAmount)
      return
    }

    await prepareWallet()

    writeContract({
      address: contract,
      abi: customFlowImplAbi,
      functionName: "increaseFlowRate",
      args: [amount],
    })
  }

  return {
    increaseFlowRate,
    isPending,
    isConfirming,
    isConfirmed,
    isLoading: isLoading || isApproving,
    hash,
    error,
    allowance,
    requiredBufferAmount,
    needsApproval: (amount: bigint) => {
      const bufferAmount = requiredBufferAmount || amount
      return allowance < bufferAmount
    },
  }
}
