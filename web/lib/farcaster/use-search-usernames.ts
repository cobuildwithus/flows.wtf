"use client"

import { useState, useEffect } from "react"
import { useServerFunction } from "@/lib/hooks/use-server-function"
import { searchFarcasterUsernames, type FarcasterProfile } from "./search-usernames"

interface UseSearchUsernamesOptions {
  query: string
  limit?: number
  debounceMs?: number
  enabled?: boolean
}

interface UseSearchUsernamesReturn {
  profiles: FarcasterProfile[]
  isLoading: boolean
  error: any
}

export function useSearchUsernames({
  query,
  limit = 10,
  debounceMs = 300,
  enabled = true,
}: UseSearchUsernamesOptions): UseSearchUsernamesReturn {
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
    data: profiles = [],
    isLoading,
    error,
  } = useServerFunction(
    searchFarcasterUsernames,
    shouldSearch ? "search-farcaster-usernames" : undefined,
    [{ query: debouncedQuery, limit }],
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 30000, // Cache for 30 seconds
    },
  )

  return {
    profiles,
    isLoading,
    error,
  }
}
