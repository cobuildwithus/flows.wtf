"use client"

import { useState, useEffect } from "react"

export function useVotingContextActive() {
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isActive) setIsActive(false)
    }

    document.addEventListener("keydown", handleEscape)
    return () => {
      document.removeEventListener("keydown", handleEscape)
    }
  }, [isActive])

  return { isActive, setIsActive }
}
