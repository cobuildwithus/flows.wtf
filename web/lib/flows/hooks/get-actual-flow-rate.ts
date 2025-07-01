"use server"

import { getClient } from "@/lib/viem/client"
import { getAddress } from "viem"
import { customFlowImplAbi } from "@/lib/abis"

/**
 * Gets the actual flow rate for a given flow contract.
 * Calls the "getActualFlowRate" view function on the flow contract.
 * Returns the flow rate as a bigint (int96).
 */
export const getActualFlowRate = async (
  contractAddress: string,
  chainId: number,
): Promise<bigint> => {
  if (!contractAddress) return 0n

  const client = getClient(chainId)

  try {
    const actualFlowRate = await client.readContract({
      address: getAddress(contractAddress),
      abi: customFlowImplAbi,
      functionName: "getActualFlowRate",
    })

    return actualFlowRate
  } catch (error) {
    console.error("Error fetching actual flow rate:", error)
    return 0n
  }
}
