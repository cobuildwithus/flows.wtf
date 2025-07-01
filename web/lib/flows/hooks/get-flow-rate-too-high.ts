"use server"

import { getClient } from "@/lib/viem/client"
import { getAddress } from "viem"
import { customFlowImplAbi } from "@/lib/abis"

/**
 * Checks if the flow rate is too high for a given flow contract.
 * Calls the "isFlowRateTooHigh" view function on the flow contract.
 * Returns a boolean indicating if the flow rate is too high.
 */
export const getFlowRateTooHigh = async (flowId: string, chainId: number): Promise<boolean> => {
  if (!flowId) return false

  const client = getClient(chainId)

  try {
    const isFlowRateTooHigh = await client.readContract({
      address: getAddress(flowId),
      abi: customFlowImplAbi,
      functionName: "isFlowRateTooHigh",
    })

    return isFlowRateTooHigh
  } catch (error) {
    console.error("Error checking if flow rate is too high:", error)
    return false
  }
}
