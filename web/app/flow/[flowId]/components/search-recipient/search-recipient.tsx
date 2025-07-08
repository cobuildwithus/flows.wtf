"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import { useEnsAddress } from "wagmi"
import { isAddress } from "viem"
import { normalize } from "viem/ens"
import {
  type FarcasterProfile,
  getProfileAddress,
  getProfileDisplayName,
  hasVerifiedAddress,
  useSearchUsernames,
} from "@/lib/farcaster"
import { useSearchFlows, type FlowSearchResult } from "@/lib/flows"
import {
  getRecipientDescription,
  getRecipientStatus,
  getRecipientTitle,
  type ValidationState,
} from "@/lib/recipient/validation-utils"
import { RecipientInput } from "./recipient-input"
import { SearchResultsPopover } from "./search-results-popover"
import { RecipientStatusDisplay } from "./recipient-status-display"

interface Props {
  flow: {
    id: string
    chainId: number
    superToken: string
  }
  disabled?: boolean
  onRecipientChange: (
    recipient: {
      address: string
      title: string
      image: string
      tagline: string
      description: string
    } | null,
  ) => void
}

export function SearchRecipient({ flow, disabled, onRecipientChange }: Props) {
  const [recipientInput, setRecipientInput] = useState("")
  const [debouncedInput, setDebouncedInput] = useState("")
  const [selectedProfile, setSelectedProfile] = useState<FarcasterProfile | null>(null)
  const [selectedFlow, setSelectedFlow] = useState<FlowSearchResult | null>(null)
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Clear all state when disabled (modal closed)
  useEffect(() => {
    if (disabled) {
      setRecipientInput("")
      setDebouncedInput("")
      setSelectedProfile(null)
      setSelectedFlow(null)
      setIsPopoverOpen(false)
    }
  }, [disabled])

  // Debounce input for search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedInput(recipientInput), 500)
    return () => clearTimeout(timer)
  }, [recipientInput])

  // Determine input type
  const isENS =
    debouncedInput.includes(".") && !debouncedInput.includes(" ") && debouncedInput.length > 4
  const isAddressLike = debouncedInput.startsWith("0x") && debouncedInput.length >= 10
  const isUsername =
    !isAddressLike && !isENS && debouncedInput.length >= 2 && !debouncedInput.includes(".")

  // Normalized ENS name derived from input (memoized)
  const normalizedENS = useMemo(() => {
    if (!isENS) return undefined
    try {
      return normalize(debouncedInput)
    } catch {
      return undefined
    }
  }, [isENS, debouncedInput])

  // ENS resolution (always on mainnet)
  const { data: ensAddress, isLoading: isLoadingENS } = useEnsAddress({
    name: normalizedENS,
    chainId: 1,
  })

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
    enabled: isUsername,
    superToken: flow.superToken,
    chainId: flow.chainId,
    excludeFlowId: flow.id,
  })

  const verifiedProfiles = useMemo(() => profiles.filter(hasVerifiedAddress), [profiles])

  // Auto-open popover when we have search results
  useEffect(() => {
    const hasResults = verifiedProfiles.length > 0 || flows.length > 0
    const isLoading = isLoadingProfiles || isLoadingFlows
    const shouldOpen = isUsername && (hasResults || isLoading) && !selectedProfile && !selectedFlow

    if (shouldOpen !== isPopoverOpen) {
      setIsPopoverOpen(shouldOpen)

      // Maintain focus on input when popover opens
      if (shouldOpen && inputRef.current) {
        // Use setTimeout to ensure this runs after the popover renders
        setTimeout(() => {
          inputRef.current?.focus()
        }, 0)
      }
    }
  }, [
    isUsername,
    verifiedProfiles.length,
    flows.length,
    selectedProfile,
    selectedFlow,
    isPopoverOpen,
    isLoadingProfiles,
    isLoadingFlows,
  ])

  // Get final recipient address
  const getRecipientAddress = () => {
    if (selectedProfile) return getProfileAddress(selectedProfile)
    if (selectedFlow) return selectedFlow.recipient
    if (isENS) return ensAddress
    return debouncedInput
  }

  const recipientAddress = getRecipientAddress()
  const isValidAddress = recipientAddress ? isAddress(recipientAddress) : false

  // Create validation state object for utils functions (memoized to prevent unnecessary re-renders)
  const validationState: ValidationState = useMemo(
    () => ({
      selectedProfile,
      selectedFlow,
      debouncedInput,
      isLoadingENS,
      isLoadingProfiles,
      isLoadingFlows,
      ensAddress,
      verifiedProfiles,
      flows,
      recipientAddress,
      recipientInput,
    }),
    [
      selectedProfile,
      selectedFlow,
      debouncedInput,
      isLoadingENS,
      isLoadingProfiles,
      isLoadingFlows,
      ensAddress,
      verifiedProfiles,
      flows,
      recipientAddress,
      recipientInput,
    ],
  )

  // Status helpers using utils
  const status = getRecipientStatus(validationState)
  const showStatus = recipientInput === debouncedInput && debouncedInput !== "" && status !== null

  // Notify parent of changes
  useEffect(() => {
    if (isValidAddress && recipientAddress) {
      onRecipientChange({
        address: recipientAddress,
        title: getRecipientTitle(validationState),
        image: selectedProfile?.avatar_url || selectedFlow?.image || "",
        tagline: selectedFlow?.tagline || "",
        description: getRecipientDescription(validationState),
      })
    } else {
      onRecipientChange(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isValidAddress, recipientAddress, selectedProfile, selectedFlow])

  // Handlers
  const handleSelectProfile = (profile: FarcasterProfile) => {
    setSelectedProfile(profile)
    setSelectedFlow(null)
    setRecipientInput(getProfileDisplayName(profile))
    setIsPopoverOpen(false)
  }

  const handleSelectFlow = (flow: FlowSearchResult) => {
    setSelectedFlow(flow)
    setSelectedProfile(null)
    setRecipientInput(flow.title)
    setIsPopoverOpen(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setRecipientInput(value)

    // Clear selected items if user types something different
    if (selectedProfile && value !== getProfileDisplayName(selectedProfile)) {
      setSelectedProfile(null)
    }
    if (selectedFlow && value !== selectedFlow.title) {
      setSelectedFlow(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="relative">
        {/* Input Field */}
        <RecipientInput
          ref={inputRef}
          value={recipientInput}
          onChange={handleInputChange}
          disabled={disabled}
          validationState={validationState}
          placeholder="0x..., ENS, Farcaster, or Flow"
          autoFocus={!disabled}
        />

        {/* Search Results Popover */}
        <SearchResultsPopover
          isOpen={isPopoverOpen}
          onOpenChange={setIsPopoverOpen}
          profiles={verifiedProfiles}
          flows={flows}
          onSelectProfile={handleSelectProfile}
          onSelectFlow={handleSelectFlow}
          isLoading={isLoadingProfiles || isLoadingFlows}
        />

        {/* Status Messages */}
        <RecipientStatusDisplay
          validationState={validationState}
          chainId={flow.chainId}
          showStatus={showStatus}
        />
      </div>
    </div>
  )
}
