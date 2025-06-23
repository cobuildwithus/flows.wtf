"use server"

import { getClient } from "@/lib/viem/client"
import { getAddress } from "viem"
import { singleAllocatorStrategyImplAbi } from "@/lib/abis"

export const getAccountAllocationWeight = async (
  allocationStrategies: string[],
  chainId: number,
  account: string | null,
): Promise<bigint> => {
  if (!account) return BigInt(0)

  const client = getClient(chainId)

  try {
    let totalWeight = BigInt(0)

    // Check each strategy to get the account's allocation weight
    for (const strategy of allocationStrategies) {
      const accountAllocationWeight = await client.readContract({
        address: getAddress(strategy),
        abi: singleAllocatorStrategyImplAbi,
        functionName: "accountAllocationWeight",
        args: [getAddress(account)],
      })
      // Sum up the allocation weights
      totalWeight += BigInt(accountAllocationWeight)
    }

    return totalWeight
  } catch (error) {
    console.error("Error checking allocation eligibility:", error)
    return BigInt(0)
  }
}
