"use server"

import database from "@/lib/database/flows-db"

export async function fetchDelegatedTokens(address: string, flowId: string) {
  const tokenRecord = await database.grant.findUnique({
    where: { id: flowId },
    select: { erc721VotingToken: true, votingTokenChainId: true },
  })

  if (!tokenRecord) return []

  const { erc721VotingToken, votingTokenChainId } = tokenRecord

  if (!erc721VotingToken || !votingTokenChainId) return []

  const tokens = await database.erc721Token.findMany({
    where: {
      contract: erc721VotingToken,
      chainId: votingTokenChainId,
      delegate: address,
    },
  })

  return tokens
}
