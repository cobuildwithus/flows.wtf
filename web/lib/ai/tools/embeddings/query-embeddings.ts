import { validTypes } from "@/lib/types/job"
import { tool } from "ai"
import { z } from "zod"
import { searchEmbeddings } from "./search-embeddings"

export const queryEmbeddings = tool({
  parameters: z.object({
    types: z.array(z.enum(validTypes)).optional(),
    query: z.string().optional(),
    tags: z.array(z.string()).optional(),
    users: z.array(z.string()).optional(),
    numResults: z.number().min(1).max(100),
  }),
  description:
    "Query embeddings database to find grants, grant applications, user information, user social media posts, and other relevant information if not immediately available in context.",
  execute: async ({ types, query, users, tags, numResults }) => {
    console.debug(
      `Querying embeddings database for types: ${types}, query: ${query}, users: ${users}, tags: ${tags}, numResults: ${numResults}`,
    )
    const results = await searchEmbeddings({
      types: types || [],
      query,
      groups: [],
      users: users || [],
      tags: tags || [],
      numResults,
    })
    return JSON.stringify(results)
  },
})
