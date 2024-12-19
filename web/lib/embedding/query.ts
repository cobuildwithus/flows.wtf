import { validTypes } from "@/lib/types/job"
import { embeddingsDb } from "./db"

interface QueryParams {
  types: (typeof validTypes)[number][]
  groups?: string[]
  users?: string[]
  tags?: string[]
  numResults?: number
  orderBy?: "similarity" | "created_at"
}

async function queryEmbeddingsWithoutSimilarity({
  types,
  groups = [],
  users = [],
  tags = [],
  numResults = 10,
}: QueryParams) {
  const whereClauses = getWhereClauses({ types, groups, users, tags })
  const query = `
    SELECT 
      id, 
      content, 
      1 AS similarity, 
      type, 
      groups, 
      users, 
      tags, 
      external_id 
    FROM embeddings
    WHERE ${whereClauses}
    LIMIT ${numResults}
  `
  return await embeddingsDb(query)
}

function getWhereClauses({ types, groups = [], users = [], tags = [] }: QueryParams) {
  const clauses = []
  if (types.length > 0)
    clauses.push(`type = ANY(ARRAY[${types.map((type) => `'${type}'`).join(",")}])`)
  if (tags.length > 0) clauses.push(`tags && ARRAY[${tags.map((tag) => `'${tag}'`).join(",")}]`)
  if (users.length > 0)
    clauses.push(`users && ARRAY[${users.map((user) => `'${user}'`).join(",")}]`)
  if (groups.length > 0)
    clauses.push(`groups && ARRAY[${groups.map((group) => `'${group}'`).join(",")}]`)
  return clauses.join(" AND ")
}

export async function queryEmbeddingsSimilarity({
  embeddingQuery,
  types,
  groups = [],
  users = [],
  tags = [],
  numResults = 10,
  orderBy = "similarity",
}: QueryParams & {
  embeddingQuery: number[] | null
  similarityCutoff?: number
}) {
  try {
    if (!embeddingQuery) {
      return queryEmbeddingsWithoutSimilarity({
        types,
        groups,
        users,
        tags,
        numResults,
      })
    }

    const vectorQuery = `ARRAY[${embeddingQuery.join(",")}]`
    const distanceExpr = `(embedding <=> ${vectorQuery}::vector)`

    const whereClauses = getWhereClauses({ types, groups, users, tags })
    const query = `
      SELECT 
        id, 
        content, 
        type, 
        groups, 
        users, 
        tags, 
        external_id, 
        external_url, 
        url_summaries 
      FROM embeddings
      WHERE ${whereClauses}
      ORDER BY ${orderBy === "similarity" ? `${distanceExpr} ASC` : `created_at DESC`}
      LIMIT ${numResults}
    `
    return await embeddingsDb(query)
  } catch (error) {
    console.error(error)
    throw new Error((error as Error).message || "Failed to query embeddings")
  }
}
