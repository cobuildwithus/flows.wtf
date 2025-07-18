"use server"

import { unstable_cache } from "next/cache"
import { getClient } from "@/lib/viem/client"
import { getAddress } from "viem"
import { singleAllocatorStrategyImplAbi } from "@/lib/abis"

/**
 * Gets the allocator address for a given allocation strategy and chainId.
 * Calls the "allocator" view function on the strategy contract.
 * Returns the address as a checksummed string.
 */
const _getAllocator = async (strategy: string, chainId: number): Promise<`0x${string}` | null> => {
  if (!strategy) return null

  const client = getClient(chainId)

  try {
    const allocator = await client.readContract({
      address: getAddress(strategy),
      abi: singleAllocatorStrategyImplAbi,
      functionName: "allocator",
    })

    return allocator.toLowerCase() as `0x${string}`
  } catch (error) {
    console.error("Error fetching allocator address:", error)
    return null
  }
}

export const getAllocator = unstable_cache(
  _getAllocator,
  ["getAllocator"],
  { revalidate: 60 }, // adjust revalidate as needed
)
