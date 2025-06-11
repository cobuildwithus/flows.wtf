"use server"

import { getClient } from "@/lib/viem/client"
import { erc721VotingStrategyImplAbi } from "@/lib/abis"
import { buildAllocationJSON } from "./build-json"
import { getAddress, Address } from "viem"

/**
 * Builds the encoded allocation data required by Flow.allocate() for **every**
 * registered allocation strategy on the supplied chain.
 *
 * A single JSON payload is forwarded to each strategyʼs `buildAllocationData` helper.
 * The helper itself is responsible for extracting only the fields relevant to the
 * strategy (using its own `strategyKey()` internally).
 *
 * The calls are executed sequentially using regular readContract calls.
 * Whenever a strategy call reverts or returns a non-success status, it is silently skipped.
 *
 * @param addresses – Array of strategy addresses to build allocation data for
 * @param caller   – Address of the user building the allocation data (passed
 *                   straight through to the contract helper).
 * @param chainId  – Chain on which the strategies live.
 * @param tokenIds – Array of ERC721 token IDs for ERC721Voting strategy (optional)
 * @returns        – An array of `bytes[]` – one entry per strategy that
 *                   successfully returned its encoded data.
 */
export const buildAllocationData = async (
  addresses: string[],
  caller: string,
  chainId: number,
  tokenIds?: number[],
): Promise<`0x${string}`[][]> => {
  const { json, strategies } = await buildAllocationJSON(addresses, chainId, tokenIds)

  if (!strategies.length) return []

  const callerAddress = getAddress(caller)
  const client = getClient(chainId)

  const allocationData: `0x${string}`[][] = []

  for (const strategy of strategies) {
    try {
      const result = await client.readContract({
        address: strategy.address as Address,
        abi: erc721VotingStrategyImplAbi,
        functionName: "buildAllocationData",
        args: [callerAddress, json],
      })
      allocationData.push(result as `0x${string}`[])
    } catch (error) {
      console.error(`Error building allocation data for strategy ${strategy.address}:`, error)
      allocationData.push([])
    }
  }

  return allocationData
}
