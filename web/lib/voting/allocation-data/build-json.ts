"use server"

import { getStrategies } from "./get-strategies"
import { AllocationStrategy } from "@prisma/flows"

export interface ERC721VotingData {
  tokenIds: number[]
}

export interface AllocationJSON {
  ERC721Voting?: ERC721VotingData
  SingleAllocator?: Record<string, never> // empty object or undefined
}

/**
 * Builds the JSON payload required by allocation strategies.
 *
 * @param addresses - Array of strategy addresses to build JSON for
 * @param chainId - Chain ID where the strategies are deployed
 * @param tokenIds - Array of ERC721 token IDs for ERC721Voting strategy (optional)
 * @returns JSON string containing strategy-specific data
 */
export const buildAllocationJSON = async (
  addresses: string[],
  chainId: number,
  tokenIds?: number[],
): Promise<{ json: string; strategies: AllocationStrategy[] }> => {
  if (!addresses.length) return { json: "{}", strategies: [] }

  const strategies = await getStrategies(addresses, chainId)

  if (!strategies.length) return { json: "{}", strategies: [] }

  const json: AllocationJSON = {}

  for (const strategy of strategies) {
    switch (strategy.strategyKey) {
      case "ERC721Voting":
        json.ERC721Voting = {
          tokenIds: tokenIds || [],
        }
        break
      case "SingleAllocator":
        // SingleAllocator doesn't require any data in the JSON
        json.SingleAllocator = {}
        break
      default:
        console.warn(`Unknown strategy key: ${strategy.strategyKey}`)
    }
  }

  return { json: JSON.stringify(json), strategies }
}
