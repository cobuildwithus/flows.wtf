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
 * Hook to upgrade ERC20 tokens to Super Tokens and create a Superfluid flow in a single transaction
 * Uses Superfluid's batch call functionality to combine operations atomically
 */
export const useCreateFlow = (args: FlowOperationConfig) => {
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
    ...getFlowOperationConfig("create", onSuccess),
  })

  const createFlow = async (
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
      operationType: "create",
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
    createFlow,
    isLoading,
    isSuccess,
    isError,
    error,
  }
}
