"use client"

import { useContractTransaction } from "@/lib/wagmi/use-contract-transaction"
import { type FlowOperationConfig, getFlowOperationConfig, validateWallet } from "./flow-operations"
import { getCfaAddress, getHostAddress } from "./addresses"
import { superfluidImplAbi, cfav1Abi } from "@/lib/abis"
import { encodeFunctionData } from "viem"
import { OPERATION_TYPE, prepareOperation } from "./operation-type"

/**
 * Hook to delete a Superfluid flow
 * Uses Superfluid's batch call functionality
 */
export function useDeleteFlow({ chainId, superTokenAddress, onSuccess }: FlowOperationConfig) {
  const { prepareWallet, writeContract, isLoading, isSuccess, isError, error } =
    useContractTransaction({
      chainId,
      ...getFlowOperationConfig("delete", onSuccess),
    })

  const deleteFlow = async (sender: `0x${string}`, receiver: `0x${string}`) => {
    await prepareWallet()
    if (!validateWallet(sender)) return

    // Build delete flow operation for batch call
    const deleteFlowData = encodeFunctionData({
      abi: cfav1Abi,
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

    writeContract({
      address: getHostAddress(chainId),
      abi: superfluidImplAbi,
      functionName: "batchCall",
      args: [operations],
      chainId,
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
