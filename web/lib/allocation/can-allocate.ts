"use server"

import { getClient } from "@/lib/viem/client"
import { getAddress } from "viem"
import { singleAllocatorStrategyImplAbi } from "@/lib/abis"

export const canAllocate = async (
  allocationStrategies: string[],
  chainId: number,
  account: string | null,
) => {
  if (!account) return false

  const client = getClient(chainId)

  try {
    // Check each strategy to see if the account can allocate
    for (const strategy of allocationStrategies) {
      const canAccountAllocate = await client.readContract({
        address: getAddress(strategy),
        abi: singleAllocatorStrategyImplAbi,
        functionName: "canAccountAllocate",
        args: [getAddress(account)],
      })

      // If any strategy allows allocation, return true
      if (canAccountAllocate) {
        return true
      }
    }

    return false
  } catch (error) {
    console.error("Error checking allocation eligibility:", error)
    return false
  }
}
