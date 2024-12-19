import { Tool } from "../tool"
import { queryEmbeddings } from "./query-embeddings"
import { embeddingToolPrompt } from "./query-embeddings-prompt"

export const queryEmbeddingsTool = {
  name: "queryEmbeddings",
  prompt: embeddingToolPrompt(),
  tool: queryEmbeddings,
} satisfies Tool
