"use server"

import { getClient } from "@/lib/viem/client"
import { getAddress } from "viem"
import { customFlowImplAbi } from "@/lib/abis"

/**
 * Gets the maximum safe flow rate for a given flow contract.
 * Calls the "getMaxSafeFlowRate" view function on the flow contract.
 * Returns the max safe flow rate as a bigint.
 */
export const getMaxSafeFlowRate = async (
  contractAddress: string,
  chainId: number,
): Promise<bigint> => {
  if (!contractAddress) return 0n

  const client = getClient(chainId)

  try {
    const maxSafeFlowRate = await client.readContract({
      address: getAddress(contractAddress),
      abi: customFlowImplAbi,
      functionName: "getMaxSafeFlowRate",
    })

    return maxSafeFlowRate
  } catch (error) {
    console.error("Error fetching max safe flow rate:", error)
    return 0n
  }
}
