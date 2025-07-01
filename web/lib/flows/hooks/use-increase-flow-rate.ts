"use client"

import { customFlowImplAbi, superTokenAbi, superfluidImplAbi } from "@/lib/abis"
import { useContractTransaction } from "@/lib/wagmi/use-contract-transaction"
import { useERC20Allowance } from "@/lib/erc20/use-erc20-allowance"
import { useState } from "react"
import { getClient } from "@/lib/viem/client"
import { useERC20Balances } from "@/lib/erc20/use-erc20-balances"
import { encodeFunctionData, erc20Abi } from "viem"
import {
  OPERATION_TYPE,
  prepareOperation,
  type Operation,
} from "@/lib/erc20/super-token/operation-type"
import { getHostAddress } from "@/lib/erc20/super-token/addresses"
import { useApproveErc20 } from "@/lib/erc20/use-approve-erc20"

interface UseIncreaseFlowRateProps {
  contract: `0x${string}`
  chainId: number
  superToken: `0x${string}`
  underlyingToken: `0x${string}`
  userAddress: `0x${string}` | undefined
  onSuccess?: (hash: string) => void
}

export function useIncreaseFlowRate({
  contract,
  chainId,
  superToken,
  underlyingToken,
  userAddress,
  onSuccess,
}: UseIncreaseFlowRateProps) {
  const [isPreparing, setIsPreparing] = useState(false)
  const [isApproving, setIsApproving] = useState(false)

  const { allowance, refetch: refetchAllowance } = useERC20Allowance(
    superToken,
    userAddress,
    contract,
    chainId,
  )
  // Fetch Super Token balance for the user
  const { balances: superTokenBalances } = useERC20Balances(
    [superToken as `0x${string}`],
    userAddress,
    chainId,
  )

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

  // Approve custom flow contract to pull buffer
  const { approve } = useApproveErc20({
    chainId,
    tokenAddress: superToken,
    spenderAddress: contract,
    onSuccess: () => {
      setIsApproving(false)
      refetchAllowance()
    },
  })

  // Approve SuperToken contract to pull underlying tokens for upgrade
  const { approve: approveUnderlying } = useApproveErc20({
    chainId,
    tokenAddress: underlyingToken,
    spenderAddress: superToken,
    onSuccess: () => {
      setIsApproving(false)
    },
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
      await prepareWallet()

      // Get buffer amount
      const bufferAmount = await getBufferAmount(amount)
      const currentSuperTokenBalance = superTokenBalances[0] || 0n

      // 1. If allowance for buffer is insufficient, initiate approval as a separate tx and exit early
      if (allowance < bufferAmount) {
        setIsApproving(true)
        await approve(bufferAmount)
      }

      setIsPreparing(true)

      const operations: Operation[] = []

      // 2. Upgrade underlying tokens to Super Tokens if balance is insufficient
      if (currentSuperTokenBalance < bufferAmount) {
        const tokensToUpgrade = bufferAmount - currentSuperTokenBalance

        // Ensure underlying token approval
        const client = getClient(chainId)
        const underlyingAllowance = (await client.readContract({
          address: underlyingToken,
          abi: erc20Abi,
          functionName: "allowance",
          args: [userAddress as `0x${string}`, superToken],
        })) as bigint

        if (underlyingAllowance < tokensToUpgrade) {
          setIsApproving(true)
          await approveUnderlying(tokensToUpgrade)
        }

        const upgradeData = encodeFunctionData({
          abi: superTokenAbi,
          functionName: "upgrade",
          args: [tokensToUpgrade],
        })

        operations.push(
          prepareOperation({
            operationType: OPERATION_TYPE.SUPERTOKEN_UPGRADE,
            target: superToken,
            data: upgradeData,
          }),
        )

        // Execute all operations atomically via Superfluid host
        writeContract({
          address: getHostAddress(chainId),
          abi: superfluidImplAbi,
          functionName: "batchCall",
          args: [operations],
          chainId,
        })

        return
      }

      // Execute all operations atomically via Superfluid host
      writeContract({
        address: contract,
        abi: customFlowImplAbi,
        functionName: "increaseFlowRate",
        args: [amount],
        chainId,
      })
    } catch (err) {
      console.error("Unable to prepare batch operation", err)
    } finally {
      setIsPreparing(false)
    }
  }

  return {
    increaseFlowRate,
    isPending,
    isConfirming,
    isConfirmed,
    isLoading: isLoading || isPreparing || isApproving,
    hash,
    error,
    allowance,
  }
}
