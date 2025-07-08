"use client"

import { useState, useRef, useEffect } from "react"
import { type FarcasterProfile, getProfileDisplayName } from "@/lib/farcaster"
import { type FlowSearchResult } from "@/lib/flows"
import { RecipientInput } from "./recipient-input"
import { SearchResultsPopover } from "./search-results-popover"
import { RecipientStatusDisplay } from "./recipient-status-display"
import { useSearch } from "./use-search"
import { useRecipientValidation } from "./use-recipient-validation"

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
  const [selectedProfile, setSelectedProfile] = useState<FarcasterProfile | null>(null)
  const [selectedFlow, setSelectedFlow] = useState<FlowSearchResult | null>(null)
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const [searchStarted, setSearchStarted] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Clear all state when disabled (modal closed)
  useEffect(() => {
    if (disabled) {
      setRecipientInput("")
      setSelectedProfile(null)
      setSelectedFlow(null)
      setIsPopoverOpen(false)
      setSearchStarted(false)
    }
  }, [disabled])

  // Use centralized search hook
  const { debouncedInput, isUsername, ensAddress, verifiedProfiles, flows, isLoading, hasResults } =
    useSearch({
      input: recipientInput,
      flowConfig: {
        superToken: flow.superToken,
        chainId: flow.chainId,
        excludeFlowId: flow.id,
      },
    })

  // Use centralized validation hook
  const { validationState, shouldShowStatus, recipient } = useRecipientValidation({
    recipientInput,
    selectedProfile,
    selectedFlow,
    debouncedInput,
    isLoading,
    ensAddress,
    verifiedProfiles,
    flows,
    isUsername,
    searchStarted,
  })

  // Auto-open popover when we have search results
  useEffect(() => {
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
  }, [isUsername, hasResults, isLoading, selectedProfile, selectedFlow, isPopoverOpen])

  // Track when search has actually started for username queries
  useEffect(() => {
    if (isUsername && debouncedInput) {
      // Give search hooks time to start (they have 200ms debounce)
      const timer = setTimeout(() => {
        setSearchStarted(true)
      }, 300)
      return () => clearTimeout(timer)
    } else {
      setSearchStarted(false)
    }
  }, [isUsername, debouncedInput])

  // Notify parent of changes
  useEffect(() => {
    onRecipientChange(recipient)
  }, [recipient, onRecipientChange])

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
          showStatus={shouldShowStatus}
        />

        {/* Search Results Popover */}
        <SearchResultsPopover
          isOpen={isPopoverOpen}
          onOpenChange={setIsPopoverOpen}
          profiles={verifiedProfiles}
          flows={flows}
          onSelectProfile={handleSelectProfile}
          onSelectFlow={handleSelectFlow}
          isLoading={isLoading}
        />

        {/* Status Messages */}
        <RecipientStatusDisplay
          validationState={validationState}
          chainId={flow.chainId}
          showStatus={shouldShowStatus}
        />
      </div>
    </div>
  )
}
