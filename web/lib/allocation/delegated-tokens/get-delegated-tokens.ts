"use server"

import database from "@/lib/database/flows-db"
import { getStrategies } from "../allocation-data/get-strategies"
import { getClient } from "@/lib/viem/client"
import { erc721VotesStrategyImplAbi } from "@/lib/abis"
import { getAddress } from "viem"
import { StrategyKey } from "../strategy-key"

export async function fetchDelegatedTokens(address: string, flowId: string) {
  const tokenRecord = await database.grant.findUnique({
    where: { id: flowId },
    select: {
      allocationStrategies: true,
      chainId: true,
    },
  })

  if (!tokenRecord) return []

  const strategies = await getStrategies(tokenRecord.allocationStrategies, tokenRecord.chainId)

  // assume support for just one ERC721 voting token for now
  // filter where strategyKey is ERC721Votes
  const erc721VotesStrategy = strategies.find(
    (strategy) => strategy.strategyKey === StrategyKey.ERC721Votes,
  )

  if (!erc721VotesStrategy) return []

  const client = getClient(tokenRecord.chainId)

  const erc721VotingToken = await client.readContract({
    address: getAddress(erc721VotesStrategy.address),
    abi: erc721VotesStrategyImplAbi,
    functionName: "token",
    args: [],
  })

  const tokens = await database.erc721Token.findMany({
    where: {
      contract: erc721VotingToken.toLowerCase(),
      chainId: tokenRecord.chainId,
      delegate: address,
    },
  })

  return tokens
}
