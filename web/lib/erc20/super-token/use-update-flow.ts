"use client"

import { useContractTransaction } from "@/lib/wagmi/use-contract-transaction"
import {
  type FlowOperationConfig,
  getFlowOperationConfig,
  validateWallet,
  buildFlowOperations,
} from "./flow-operations"
import { getHostAddress } from "./addresses"
import { superfluidImplAbi } from "@/lib/abis"
import { getClient } from "@/lib/viem/client"

/**
 * Hook to upgrade ERC20 tokens to Super Tokens and update a Superfluid flow in a single transaction
 * Uses Superfluid's batch call functionality to combine operations atomically
 */
export const useUpdateFlow = (args: FlowOperationConfig) => {
  const { chainId, superTokenAddress, onSuccess } = args

  const {
    prepareWallet,
    writeContractAsync,
    isLoading,
    isSuccess,
    isError,
    error,
    account: sender,
  } = useContractTransaction({
    chainId,
    ...getFlowOperationConfig("update", onSuccess),
  })

  const updateFlow = async (
    amountToUpgrade: bigint,
    receiver: `0x${string}`,
    monthlyFlowRate: bigint,
  ) => {
    await prepareWallet()
    if (!validateWallet(sender)) return

    const operations = buildFlowOperations({
      amountToUpgrade,
      receiver,
      monthlyFlowRate,
      superTokenAddress,
      chainId,
      operationType: "update",
    })

    const hash = await writeContractAsync({
      address: getHostAddress(chainId),
      abi: superfluidImplAbi,
      functionName: "batchCall",
      args: [operations],
      chainId,
    })

    const client = getClient(chainId)

    await client.waitForTransactionReceipt({
      hash,
    })
  }

  return {
    updateFlow,
    isLoading,
    isSuccess,
    isError,
    error,
  }
}
