"use client"

import { useMemo } from "react"
import { isAddress } from "viem"
import { type FarcasterProfile, getProfileAddress, getProfileDisplayName } from "@/lib/farcaster"
import { type FlowSearchResult } from "@/lib/flows"
import {
  getRecipientDescription,
  getRecipientStatus,
  getRecipientTitle,
  type ValidationState,
} from "@/lib/recipient/validation-utils"

interface UseRecipientValidationParams {
  recipientInput: string
  selectedProfile: FarcasterProfile | null
  selectedFlow: FlowSearchResult | null
  debouncedInput: string
  isLoading: boolean
  ensAddress: string | undefined
  verifiedProfiles: FarcasterProfile[]
  flows: FlowSearchResult[]
  isUsername: boolean
  searchStarted: boolean
}

interface UseRecipientValidationResult {
  recipientAddress: string | undefined
  isValidAddress: boolean
  validationState: ValidationState
  status: ReturnType<typeof getRecipientStatus>
  shouldShowStatus: boolean
  recipient: {
    address: string
    title: string
    image: string
    tagline: string
    description: string
  } | null
}

export function useRecipientValidation({
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
}: UseRecipientValidationParams): UseRecipientValidationResult {
  // Get final recipient address
  const getRecipientAddress = () => {
    if (selectedProfile) return getProfileAddress(selectedProfile)
    if (selectedFlow) return selectedFlow.recipient
    if (ensAddress) return ensAddress
    return debouncedInput
  }

  const recipientAddressResult = getRecipientAddress()
  const recipientAddress = recipientAddressResult ?? undefined
  const isValidAddress = recipientAddress ? isAddress(recipientAddress) : false

  // Create validation state object (memoized to prevent unnecessary re-renders)
  const validationState: ValidationState = useMemo(
    () => ({
      selectedProfile,
      selectedFlow,
      debouncedInput,
      isLoading,
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
      isLoading,
      ensAddress,
      verifiedProfiles,
      flows,
      recipientAddress,
      recipientInput,
    ],
  )

  // Status helpers
  const status = getRecipientStatus(validationState)
  const showStatus = recipientInput === debouncedInput && debouncedInput !== "" && status !== null

  // Only suppress "no results" error for username searches that haven't started
  const shouldShowStatus = showStatus && !(status === "error" && isUsername && !searchStarted)

  // Build recipient object
  const recipient = useMemo(() => {
    if (!isValidAddress || !recipientAddress) return null

    return {
      address: recipientAddress,
      title: getRecipientTitle(validationState),
      image: selectedProfile?.avatar_url || selectedFlow?.image || "",
      tagline: selectedFlow?.tagline || "",
      description: getRecipientDescription(validationState),
    }
  }, [isValidAddress, recipientAddress, selectedProfile, selectedFlow, validationState])

  return {
    recipientAddress,
    isValidAddress,
    validationState,
    status,
    shouldShowStatus,
    recipient,
  }
}
