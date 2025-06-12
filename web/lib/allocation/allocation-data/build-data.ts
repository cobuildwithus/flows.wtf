"use server"

import { encodeAbiParameters } from "viem"
import { getStrategies } from "./get-strategies"

export interface ERC721VotesData {
  tokenIds: number[]
}

export interface AllocationJSON {
  ERC721Votes?: ERC721VotesData
  SingleAllocator?: Record<string, never> // empty object or undefined
}

export enum StrategyKey {
  ERC721Votes = "ERC721Votes",
  SingleAllocator = "SingleAllocator",
}

/**
 * Builds the JSON payload required by allocation strategies.
 *
 * @param allocationStrategies - Array of strategy addresses to build JSON for
 * @param chainId - Chain ID where the strategies are deployed
 * @param tokenIds - Array of ERC721 token IDs for ERC721Votes strategy (optional)
 * @returns JSON string containing strategy-specific data
 */
export const buildAllocationData = async (
  allocationStrategies: string[],
  chainId: number,
  tokenIds?: number[],
): Promise<{
  allocationData: `0x${string}`[][]
}> => {
  if (!allocationStrategies.length) return { allocationData: [] }

  const strategies = await getStrategies(allocationStrategies, chainId)

  if (!strategies.length) return { allocationData: [] }

  const allocationData: `0x${string}`[][] = []

  for (const strategy of strategies) {
    switch (strategy.strategyKey) {
      case StrategyKey.ERC721Votes:
        allocationData.push(
          tokenIds?.map((id) => encodeAbiParameters([{ type: "uint256" }], [BigInt(id)])) || [],
        )
        break
      case StrategyKey.SingleAllocator:
        // SingleAllocator doesn't require any data in the JSON
        allocationData.push([])
        break
      default:
        allocationData.push([])
        console.warn(`Unknown strategy key: ${strategy.strategyKey}`)
    }
  }

  return {
    allocationData,
  }
}
