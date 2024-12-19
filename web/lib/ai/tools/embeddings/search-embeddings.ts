"use server"

import { validTypes } from "@/lib/types/job"
import { z } from "zod"
import { generateEmbedding } from "../../../embedding/generate-embedding"
import { queryEmbeddingsSimilarity } from "@/lib/embedding/query"

const embeddingQuerySchema = z.object({
  types: z.array(z.enum(validTypes)).optional(),
  query: z.string().trim().optional(),
  groups: z.array(z.string().trim()).optional(),
  users: z.array(z.string().trim().toLowerCase()).optional(),
  tags: z.array(z.string().trim()).optional(),
  numResults: z.number().min(1).max(100),
  orderBy: z.enum(["similarity", "created_at"]).optional(),
})

export async function searchEmbeddings({
  types,
  query,
  groups,
  users,
  tags,
  numResults,
  orderBy,
}: z.infer<typeof embeddingQuerySchema>) {
  try {
    const validation = embeddingQuerySchema.safeParse({
      types,
      query,
      groups,
      users,
      tags,
      numResults,
      orderBy,
    })

    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors
      console.error(errors)
      throw new Error(Object.values(errors).flat().join(", "))
    }

    console.time("generateEmbedding")
    const embeddingQuery = query ? await generateEmbedding(query) : null
    console.timeEnd("generateEmbedding")

    console.time("queryEmbeddingsSimilarity")
    const results = await queryEmbeddingsSimilarity({
      embeddingQuery,
      types: types || [],
      groups: groups || [],
      users: users || [],
      tags: tags || [],
      numResults,
    })
    console.timeEnd("queryEmbeddingsSimilarity")

    console.log(`got ${results.length} results`)

    return results
  } catch (error) {
    console.error(error)
    return (error as Error).message
  }
}
