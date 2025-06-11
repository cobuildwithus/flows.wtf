"use server"

import { getClient } from "@/lib/viem/client"
import { getEthAddress } from "@/lib/utils"
import { Address } from "viem"
import { getStrategies } from "./get-strategies"
import { singleAllocatorStrategyImplAbi } from "@/lib/abis"

export const canAllocate = async (
  allocationStrategies: string[],
  chainId: number,
  account: string | null,
) => {
  console.log("canAllocate", allocationStrategies, chainId, account)
  if (!account) return false

  const strategies = await getStrategies(allocationStrategies, chainId)
  const client = getClient(chainId)

  try {
    // Check each strategy to see if the account can allocate
    for (const strategy of strategies) {
      const canAccountAllocate = await client.readContract({
        address: getEthAddress(strategy.address) as Address,
        abi: singleAllocatorStrategyImplAbi,
        functionName: "canAccountAllocate",
        args: [getEthAddress(account) as Address],
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
