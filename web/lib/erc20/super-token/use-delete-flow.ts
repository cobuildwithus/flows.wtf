"use client"

import { useContractTransaction } from "@/lib/wagmi/use-contract-transaction"
import { type FlowOperationConfig, getFlowOperationConfig, validateWallet } from "./flow-operations"
import { getCfaAddress, getHostAddress } from "./addresses"
import { superfluidImplAbi, cfav1Abi, cfav1ImplAbi } from "@/lib/abis"
import { encodeFunctionData } from "viem"
import { OPERATION_TYPE, prepareOperation } from "./operation-type"
import { getClient } from "@/lib/viem/client"

/**
 * Hook to delete a Superfluid flow
 * Uses Superfluid's batch call functionality
 */
export function useDeleteFlow({ chainId, superTokenAddress, onSuccess }: FlowOperationConfig) {
  const { prepareWallet, writeContractAsync, isLoading, isSuccess, isError, error } =
    useContractTransaction({
      chainId,
      ...getFlowOperationConfig("delete", onSuccess),
    })

  const deleteFlow = async (sender: `0x${string}`, receiver: `0x${string}`) => {
    await prepareWallet()
    if (!validateWallet(sender)) return

    // Build delete flow operation for batch call
    const deleteFlowData = encodeFunctionData({
      abi: cfav1ImplAbi,
      functionName: "deleteFlow",
      args: [superTokenAddress, sender!, receiver, "0x"],
    })

    const operations = [
      prepareOperation({
        operationType: OPERATION_TYPE.SUPERFLUID_CALL_AGREEMENT,
        target: getCfaAddress(chainId),
        data: deleteFlowData,
      }),
    ]

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
    deleteFlow,
    isLoading,
    isSuccess,
    isError,
    error,
  }
}
