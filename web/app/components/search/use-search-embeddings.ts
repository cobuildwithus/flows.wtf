"use client"

import { toast } from "sonner"
import useSWR from "swr"
import { z } from "zod"

const searchResultSchema = z.object({
  grant: z
    .array(
      z.object({
        type: z.string(),
        id: z.string(),
        similarity: z.number().optional(),
        created_at: z.string().optional(),
        data: z
          .object({
            id: z.string(),
            title: z.string(),
            description: z.string(),
            image: z.string().optional(),
          })
          .optional(),
      }),
    )
    .optional(),
})

interface SearchParams {
  types?: string[]
  query?: string
  tags?: string[]
  users?: string[]
  numResults?: number
  orderBy?: "similarity" | "created_at"
}

export function useSearchEmbeddings(
  params: SearchParams,
  skip?: boolean,
): {
  results: z.infer<typeof searchResultSchema> | undefined
  error: Error | null
  isLoading: boolean
} {
  const { data, error, isLoading } = useSWR(
    params.query && !skip ? ["search-embeddings", params] : null,
    async ([_, params]) => {
      try {
        const queryParams = new URLSearchParams()
        if (params.query) queryParams.set("query", params.query)
        if (params.types) queryParams.set("types", params.types.join(","))
        if (params.tags) queryParams.set("tags", params.tags.join(","))
        if (params.users) queryParams.set("users", params.users.join(","))
        if (params.numResults) queryParams.set("numResults", params.numResults.toString())
        if (params.orderBy) queryParams.set("orderBy", params.orderBy)

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_CHAT_API_URL}/api/search-embeddings?${queryParams}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          },
        )

        if (!response.ok) {
          throw new Error(`Search embeddings failed: ${response.statusText}`)
        }

        const json = await response.json()
        const { data: results, error } = searchResultSchema.safeParse(json)

        if (!results) {
          throw new Error(`Invalid search results: ${error}`)
        }

        return json
      } catch (err) {
        toast.error("Search embeddings error:", {
          description: err instanceof Error ? err.message : "Unknown error",
        })
      }
    },
  )

  return {
    results: data,
    error,
    isLoading,
  }
}
