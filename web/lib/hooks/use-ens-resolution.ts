"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { resolveEnsToAddress } from "@/lib/auth/ens"
import { isValidEthAddress, isValidEnsName } from "@/lib/ens/ens-helpers"

interface UseEnsResolutionReturn {
  resolvedAddress: string | null
  isResolving: boolean
  error: string | null
  inputValue: string
  handleInputChange: (value: string) => void
}

export function useEnsResolution(initialValue = ""): UseEnsResolutionReturn {
  const [inputValue, setInputValue] = useState(initialValue)
  const [resolvedAddress, setResolvedAddress] = useState<string | null>(null)
  const [isResolving, setIsResolving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const resolveEns = useCallback(async (value: string) => {
    // Clear previous states
    setError(null)
    setResolvedAddress(null)

    if (!value) {
      setIsResolving(false)
      return
    }

    // If it's already a valid ETH address, no need to resolve
    if (isValidEthAddress(value)) {
      setIsResolving(false)
      return
    }

    // Check if it's a valid ENS name
    if (!isValidEnsName(value)) {
      setError("Invalid ENS name format")
      setIsResolving(false)
      return
    }

    // Resolve ENS name
    setIsResolving(true)
    try {
      const address = await resolveEnsToAddress(value)
      if (address) {
        setResolvedAddress(address)
        setError(null)
      } else {
        setError("ENS name not found")
      }
    } catch (err) {
      console.error("ENS resolution error:", err)
      setError("Failed to resolve ENS name")
    } finally {
      setIsResolving(false)
    }
  }, [])

  const handleInputChange = useCallback(
    (value: string) => {
      setInputValue(value)

      // Clear previous timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      // Set loading state immediately for better UX
      if (value && !isValidEthAddress(value)) {
        setIsResolving(true)
      }

      // Debounce the actual resolution
      timeoutRef.current = setTimeout(() => {
        resolveEns(value)
      }, 500)
    },
    [resolveEns],
  )

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return {
    resolvedAddress,
    isResolving,
    error,
    inputValue,
    handleInputChange,
  }
}
