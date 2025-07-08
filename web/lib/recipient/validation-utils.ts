import { type FarcasterProfile, getProfileDisplayName, hasVerifiedAddress } from "@/lib/farcaster"
import type { FlowSearchResult } from "@/lib/flows/types"
import { isAddress } from "viem"

export interface ValidationState {
  selectedProfile: FarcasterProfile | null
  selectedFlow: FlowSearchResult | null
  debouncedInput: string
  isLoading: boolean
  ensAddress: string | null | undefined
  verifiedProfiles: FarcasterProfile[]
  flows: FlowSearchResult[]
  recipientAddress: string | null | undefined
  recipientInput: string
}

export function getRecipientStatus(state: ValidationState) {
  const {
    selectedProfile,
    selectedFlow,
    debouncedInput,
    isLoading,
    ensAddress,
    verifiedProfiles,
    flows,
    recipientAddress,
  } = state

  if (selectedProfile) {
    return hasVerifiedAddress(selectedProfile) ? "success" : "error"
  }

  if (selectedFlow) {
    return "success"
  }

  if (!debouncedInput) return null
  if (isLoading) return "loading"

  const isENS =
    debouncedInput.includes(".") && !debouncedInput.includes(" ") && debouncedInput.length > 4
  const isAddressLike = debouncedInput.startsWith("0x") && debouncedInput.length >= 10
  const isSearchQuery =
    !isAddressLike && !isENS && debouncedInput.length >= 2 && !debouncedInput.includes(".")

  if (isSearchQuery) {
    if (verifiedProfiles.length > 0 || flows.length > 0) return null // Don't show status while dropdown is visible
    return isLoading ? "loading" : "error"
  }

  if (isENS && !ensAddress) return "error"
  if (recipientAddress && isAddress(recipientAddress)) return "success"
  return "error"
}

export function getRecipientStatusColor(status: string | null) {
  if (status === "loading") return "text-yellow-500"
  if (status === "success") return "text-green-500"
  if (status === "error") return "text-red-500"
  return ""
}

export function getRecipientStatusMessage(state: ValidationState) {
  const {
    selectedProfile,
    selectedFlow,
    debouncedInput,
    isLoading,
    ensAddress,
    verifiedProfiles,
    flows,
    recipientAddress,
  } = state

  if (selectedProfile) {
    return hasVerifiedAddress(selectedProfile)
      ? "User has verified address"
      : "User has no verified address"
  }

  if (selectedFlow) {
    return "Flow selected"
  }

  if (!debouncedInput) return ""
  if (isLoading) return "Searching..."

  const isENS =
    debouncedInput.includes(".") && !debouncedInput.includes(" ") && debouncedInput.length > 4
  const isAddressLike = debouncedInput.startsWith("0x") && debouncedInput.length >= 10
  const isSearchQuery =
    !isAddressLike && !isENS && debouncedInput.length >= 2 && !debouncedInput.includes(".")

  if (isENS && ensAddress) return `Resolved to: ${ensAddress.slice(0, 6)}...${ensAddress.slice(-4)}`
  if (isENS && !ensAddress) return "ENS name not found"
  if (recipientAddress && isAddress(recipientAddress)) return "Valid Ethereum address"
  if (isSearchQuery && verifiedProfiles.length === 0 && flows.length === 0 && !isLoading)
    return "No results found"
  return "Invalid address format"
}

export function getRecipientErrorMessage(state: ValidationState) {
  const {
    selectedProfile,
    debouncedInput,
    isLoading,
    ensAddress,
    verifiedProfiles,
    flows,
    recipientAddress,
  } = state

  if (selectedProfile && !hasVerifiedAddress(selectedProfile)) {
    return "User has no verified address"
  }

  const status = getRecipientStatus(state)
  if (!debouncedInput || status !== "error") return ""

  const isENS =
    debouncedInput.includes(".") && !debouncedInput.includes(" ") && debouncedInput.length > 4
  const isAddressLike = debouncedInput.startsWith("0x") && debouncedInput.length >= 10
  const isSearchQuery =
    !isAddressLike && !isENS && debouncedInput.length >= 2 && !debouncedInput.includes(".")

  if (isENS && !ensAddress) return "ENS name not found"
  if (isSearchQuery && verifiedProfiles.length === 0 && flows.length === 0 && !isLoading)
    return "No results found"
  if (!isSearchQuery && !isENS && recipientAddress && !isAddress(recipientAddress))
    return "Invalid address format"
  return ""
}

export function getRecipientTitle(state: ValidationState) {
  const { selectedProfile, selectedFlow, recipientInput, recipientAddress } = state

  if (selectedProfile) return getProfileDisplayName(selectedProfile)
  if (selectedFlow) return selectedFlow.title
  if (recipientInput.includes(".")) return recipientInput
  if (recipientAddress) return `${recipientAddress.slice(0, 6)}...${recipientAddress.slice(-4)}`
  return recipientInput
}

export function getRecipientDescription(state: ValidationState) {
  const { selectedProfile, selectedFlow } = state

  if (selectedProfile) return selectedProfile.bio || ""
  if (selectedFlow) return selectedFlow.description || ""
  return ""
}
