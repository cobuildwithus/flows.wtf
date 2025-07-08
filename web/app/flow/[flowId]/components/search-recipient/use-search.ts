"use client"

import { useState, useEffect, useMemo } from "react"
import { useEnsAddress } from "wagmi"
import { normalize } from "viem/ens"
import { type FarcasterProfile, hasVerifiedAddress, useSearchUsernames } from "@/lib/farcaster"
import { useSearchFlows, type FlowSearchResult } from "@/lib/flows"

interface UseSearchParams {
  input: string
  debounceMs?: number
  flowConfig?: {
    superToken: string
    chainId: number
    excludeFlowId: string
  }
}

interface UseSearchResult {
  // Search states
  debouncedInput: string
  isENS: boolean
  isAddressLike: boolean
  isUsername: boolean

  // ENS
  normalizedENS: string | undefined
  ensAddress: string | undefined
  isLoadingENS: boolean

  // Farcaster
  profiles: FarcasterProfile[]
  verifiedProfiles: FarcasterProfile[]
  isLoadingProfiles: boolean

  // Flows
  flows: FlowSearchResult[]
  isLoadingFlows: boolean

  // Combined states
  isLoading: boolean
  hasResults: boolean
}

export function useSearch({
  input,
  debounceMs = 500,
  flowConfig,
}: UseSearchParams): UseSearchResult {
  const [debouncedInput, setDebouncedInput] = useState("")

  // Debounce input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedInput(input), debounceMs)
    return () => clearTimeout(timer)
  }, [input, debounceMs])

  // Determine input type
  const isENS =
    debouncedInput.includes(".") && !debouncedInput.includes(" ") && debouncedInput.length > 4

  const isAddressLike = debouncedInput.startsWith("0x") && debouncedInput.length >= 10

  const isUsername =
    !isAddressLike && !isENS && debouncedInput.length >= 1 && !debouncedInput.includes(".")

  // Normalized ENS name
  const normalizedENS = useMemo(() => {
    if (!isENS) return undefined
    try {
      return normalize(debouncedInput)
    } catch {
      return undefined
    }
  }, [isENS, debouncedInput])

  // ENS resolution (always on mainnet)
  const { data: ensAddressData, isLoading: isLoadingENS } = useEnsAddress({
    name: normalizedENS,
    chainId: 1,
  })

  const ensAddress = ensAddressData ?? undefined

  // Farcaster username search
  const { profiles, isLoading: isLoadingProfiles } = useSearchUsernames({
    query: debouncedInput,
    limit: 20,
    debounceMs: 200,
    enabled: isUsername,
  })

  // Flow search
  const { flows, isLoading: isLoadingFlows } = useSearchFlows({
    query: debouncedInput,
    limit: 10,
    debounceMs: 200,
    enabled: isUsername && !!flowConfig,
    superToken: flowConfig?.superToken,
    chainId: flowConfig?.chainId,
    excludeFlowId: flowConfig?.excludeFlowId,
  })

  const verifiedProfiles = useMemo(() => profiles.filter(hasVerifiedAddress), [profiles])

  const isLoading = isLoadingENS || isLoadingProfiles || isLoadingFlows
  const hasResults = verifiedProfiles.length > 0 || flows.length > 0

  return {
    // Search states
    debouncedInput,
    isENS,
    isAddressLike,
    isUsername,

    // ENS
    normalizedENS,
    ensAddress,
    isLoadingENS,

    // Farcaster
    profiles,
    verifiedProfiles,
    isLoadingProfiles,

    // Flows
    flows,
    isLoadingFlows,

    // Combined states
    isLoading,
    hasResults,
  }
}
