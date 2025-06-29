"use client"

import { customFlowImplAbi } from "@/lib/abis"
import { useContractTransaction } from "@/lib/wagmi/use-contract-transaction"
import { useERC20Allowance } from "@/lib/erc20/use-erc20-allowance"
import { useApproveErc20 } from "@/lib/erc20/use-approve-erc20"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { getClient } from "@/lib/viem/client"

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
  const router = useRouter()
  const [isApproving, setIsApproving] = useState(false)

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
      router.refresh()
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

  const getBufferAmount = async (amount: bigint): Promise<bigint> => {
    const client = getClient(chainId)
    return (await client.readContract({
      address: contract,
      abi: customFlowImplAbi,
      functionName: "getRequiredBufferAmount",
      args: [amount],
    })) as bigint
  }

  const increaseFlowRate = async (amount: bigint) => {
    if (!userAddress) return

    try {
      const bufferAmount = await getBufferAmount(amount)

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
    } catch (err) {
      console.error("Unable to fetch required buffer amount", err)
    }
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
  }
}
