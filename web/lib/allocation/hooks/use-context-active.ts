"use client"

import { useState, useEffect } from "react"

export function useAllocationContextActive(defaultActive: boolean) {
  const [isActive, setIsActive] = useState(defaultActive)

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
