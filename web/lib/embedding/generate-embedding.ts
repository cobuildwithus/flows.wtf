"use server"

import { embed } from "ai"
import { openai } from "@/lib/ai/providers/openai"
import { cleanTextForEmbedding } from "./utils"

export async function generateEmbedding(content: string): Promise<number[]> {
  try {
    const { embedding } = await embed({
      model: openai.embedding("text-embedding-3-small"),
      value: cleanTextForEmbedding(content),
    })

    return embedding
  } catch (error) {
    console.error(error)
    throw new Error((error as Error).message || "Failed to generate embedding")
  }
}
