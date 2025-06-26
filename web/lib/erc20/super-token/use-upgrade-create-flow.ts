"use client"

import { superTokenAbi, superfluidImplAbi, cfav1Abi } from "@/lib/abis"
import { useContractTransaction } from "@/lib/wagmi/use-contract-transaction"
import { encodeFunctionData } from "viem"
import { calculateFlowratePerSecond, TIME_UNIT } from "./flow-rate"
import { toast } from "sonner"
import { OPERATION_TYPE, prepareOperation } from "./operation-type"
import { getCfaAddress, getHostAddress } from "./addresses"

/**
 * Hook to upgrade ERC20 tokens to Super Tokens and create a Superfluid flow in a single transaction
 * Uses Superfluid's batch call functionality to combine operations atomically
 */
export const useUpgradeAndCreateFlow = (args: {
  chainId: number
  superTokenAddress: `0x${string}`
  onSuccess?: (hash: string) => void
}) => {
  const { chainId, superTokenAddress, onSuccess } = args

  const {
    prepareWallet,
    writeContract,
    isLoading,
    isSuccess,
    isError,
    error,
    account: sender,
  } = useContractTransaction({
    chainId,
    loading: "Creating flow...",
    success: "Flow created successfully",
    onSuccess,
  })

  const createFlow = async (
    amountToUpgrade: bigint,
    receiver: `0x${string}`,
    monthlyFlowRate: bigint,
  ) => {
    await prepareWallet()
    if (!sender) return toast.error("Please connect your wallet")

    // Convert monthly flow rate to per-second flow rate for Superfluid
    const flowRate = calculateFlowratePerSecond({
      amountWei: monthlyFlowRate,
      timeUnit: TIME_UNIT.month,
    })

    const ops = []

    // First operation: Upgrade ERC20 tokens to Super Tokens (if amount > 0)
    if (amountToUpgrade > 0n) {
      const upgradeData = encodeFunctionData({
        abi: superTokenAbi,
        functionName: "upgrade",
        args: [amountToUpgrade],
      })

      ops.push(
        prepareOperation({
          operationType: OPERATION_TYPE.SUPERTOKEN_UPGRADE,
          target: superTokenAddress,
          data: upgradeData,
        }),
      )
    }

    // Second operation: Create a Superfluid flow to the receiver
    const createFlowData = encodeFunctionData({
      abi: cfav1Abi,
      functionName: "createFlow",
      args: [superTokenAddress, receiver, flowRate, "0x"],
    })

    ops.push(
      prepareOperation({
        operationType: OPERATION_TYPE.SUPERFLUID_CALL_AGREEMENT,
        target: getCfaAddress(chainId),
        data: createFlowData,
      }),
    )

    // Execute both operations atomically using Superfluid's batch call
    writeContract({
      address: getHostAddress(chainId),
      abi: superfluidImplAbi,
      functionName: "batchCall",
      args: [ops],
      chainId,
    })
  }

  return {
    createFlow,
    isLoading,
    isSuccess,
    isError,
    error,
  }
}
