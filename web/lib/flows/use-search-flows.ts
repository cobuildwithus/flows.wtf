"use client"

import { useState, useEffect } from "react"
import { useServerFunction } from "@/lib/hooks/use-server-function"
import { searchFlows } from "./search-flows"
import type { FlowSearchResult } from "./types"

interface UseSearchFlowsOptions {
  query: string
  limit?: number
  debounceMs?: number
  enabled?: boolean
  superToken?: string
  chainId?: number
  excludeFlowId?: string
}

interface UseSearchFlowsReturn {
  flows: FlowSearchResult[]
  isLoading: boolean
  error: any
}

export function useSearchFlows({
  query,
  limit = 10,
  debounceMs = 300,
  enabled = true,
  superToken,
  chainId,
  excludeFlowId,
}: UseSearchFlowsOptions): UseSearchFlowsReturn {
  const [debouncedQuery, setDebouncedQuery] = useState("")

  // Debounce the query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query)
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [query, debounceMs])

  // Only search if query is long enough and enabled
  const shouldSearch = enabled && debouncedQuery.length >= 2

  const {
    data: flows = [],
    isLoading,
    error,
  } = useServerFunction(
    searchFlows,
    shouldSearch ? "search-flows" : undefined,
    [{ query: debouncedQuery, limit, superToken, chainId, excludeFlowId }],
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 30000, // Cache for 30 seconds
    },
  )

  return {
    flows,
    isLoading,
    error,
  }
}
