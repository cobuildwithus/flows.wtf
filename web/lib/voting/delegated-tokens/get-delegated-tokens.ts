"use server"

import { NOUNS_SUBGRAPH_ID } from "@/lib/config"
import database from "@/lib/database/edge"
import { getEthAddress } from "@/lib/utils"

const SUBGRAPH_URL = `https://gateway.thegraph.com/api/${process.env.SUBGRAPH_API_KEY}/subgraphs/id/${NOUNS_SUBGRAPH_ID}`

export async function fetchDelegatedTokens(address: string, flowId: string | null) {
  if (flowId) {
    const tokenRecord = await database.grant.findUnique({
      where: { id: flowId },
      select: { erc721VotingToken: true, votingTokenChainId: true },
    })
  }

  const query = `
    query {
      delegate(id: "${address}") {
        nounsRepresented {
          id
          owner {
            id
          }
        }
      }
    }
  `

  const response = await fetch(SUBGRAPH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  })

  if (!response.ok) throw new Error(`Subgraph API error: ${response.status}`)

  const json: {
    data: { delegate: { nounsRepresented: Array<{ id: string; owner: { id: string } }> } }
    errors?: Array<{ message: string }>
  } = await response.json()

  if (json.errors) {
    console.error(json.errors)
    throw new Error(`Subgraph query error: ${json.errors[0].message}`)
  }

  if (!json.data.delegate?.nounsRepresented) return []

  return json.data.delegate.nounsRepresented.map((noun) => ({
    id: noun.id,
    owner: getEthAddress(noun.owner.id),
  }))
}
