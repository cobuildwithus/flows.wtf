"use server"

import { getClient } from "@/lib/viem/client"
import { getAddress } from "viem"
import { singleAllocatorStrategyImplAbi } from "@/lib/abis"
import { base, mainnet, optimism } from "viem/chains"
import { getStrategies } from "@/lib/allocation/allocation-data/get-strategies"
import { StrategyKey } from "@/lib/allocation/strategy-key"

/**
 * Gets the total allocation weight from all ERC721Votes allocation strategy contracts
 * Sums the "totalAllocationWeight" from each matching strategy contract.
 * Returns the value as a BigInt.
 */
export async function getTotalAllocationWeight(allocationStrategies: string[], chainId: number) {
  if (!allocationStrategies.length) {
    return 0n
  }

  // Only support base and mainnet for now
  if (chainId !== base.id && chainId !== mainnet.id && chainId !== optimism.id) {
    throw new Error("Voting token chain id is not supported")
  }

  // Fetch all strategies from DB
  const strategies = await getStrategies(allocationStrategies, chainId)

  const erc721VoteStrategies = strategies.filter((s) => s.strategyKey === StrategyKey.ERC721Votes)

  if (!erc721VoteStrategies.length) {
    return 0n
  }

  const client = getClient(chainId)

  const results = await Promise.all(
    erc721VoteStrategies.map(async (strategy) => {
      const strategyAddress = getAddress(strategy.address)
      try {
        const totalAllocationWeight = await client.readContract({
          address: strategyAddress,
          abi: singleAllocatorStrategyImplAbi,
          functionName: "totalAllocationWeight",
        })
        if (typeof totalAllocationWeight === "bigint") {
          return totalAllocationWeight
        }
      } catch (error) {
        console.error(
          `Error fetching total allocation weight for strategy ${strategyAddress}:`,
          error,
        )
      }
      return 0n
    }),
  )

  // Sum all the results
  return results.reduce((acc, val) => acc + val, 0n)
}
