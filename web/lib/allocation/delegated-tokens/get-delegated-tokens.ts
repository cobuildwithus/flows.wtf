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

  // Use Builder subgraph (Goldsky) for Base (8453) to fetch delegated token IDs
  if (tokenRecord.chainId !== 8453) return []

  const BUILDER_GQL_BASE =
    "https://api.goldsky.com/api/public/project_cm33ek8kjx6pz010i2c3w8z25/subgraphs/nouns-builder-base-mainnet/latest/gn"

  const TOKENS_QUERY = `
    query TokensDelegatedTo($token: Bytes!, $delegate: Bytes!, $first: Int!, $skip: Int!) {
      daos(where: { tokenAddress: $token }) {
        tokens(
          where: { voterInfo_: { voter: $delegate } }
          first: $first
          skip: $skip
        ) {
          tokenId
          owner
        }
      }
    }
  `

  type TokensQueryResult = {
    data?: {
      daos: Array<{
        tokens: Array<{
          tokenId: string
          owner: string
        }>
      }>
    }
    errors?: Array<{ message: string }>
  }

  const tokenAddress = getAddress(erc721VotingToken as `0x${string}`).toLowerCase()
  const delegateAddress = getAddress(address as `0x${string}`).toLowerCase()

  const pageSize = 1000
  let skip = 0
  const out: Array<{ tokenId: string; owner: `0x${string}`; contract: `0x${string}` }> = []

  // Paginate through all delegated tokens
  while (true) {
    const res = await fetch(BUILDER_GQL_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: TOKENS_QUERY,
        variables: { token: tokenAddress, delegate: delegateAddress, first: pageSize, skip },
      }),
      // Goldsky allows caching; however, delegations can change frequently. Prefer no-store.
      cache: "no-store",
    })

    if (!res.ok) return []

    const json = (await res.json()) as TokensQueryResult
    if (json.errors?.length) return []

    const tokens = json.data?.daos?.[0]?.tokens ?? []
    for (const t of tokens) {
      out.push({
        tokenId: t.tokenId,
        owner: t.owner as `0x${string}`,
        contract: tokenAddress as `0x${string}`,
      })
    }

    if (tokens.length < pageSize) break
    skip += pageSize
  }

  return out
}
