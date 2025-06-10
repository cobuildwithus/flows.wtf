"use client"

import { useTheme } from "next-themes"
import { usePathname } from "next/navigation"
import { useCallback, useEffect, useMemo, useState } from "react"
import { CustomFlow, getCustomFlow, getCustomVariables } from "./custom-flows"

export function useCustomStyles() {
  const [styles, setStyles] = useState<CustomFlow["styles"] | null>(null)
  const { resolvedTheme } = useTheme()
  const pathname = usePathname()

  const variables = useMemo(() => getCustomVariables(), [])
  const resetStyles = useCallback(() => {
    variables.forEach((property) => {
      document.body.style.removeProperty(property)
    })
  }, [variables])

  useEffect(() => {
    const name = pathname.substring(1) as any
    const customFlow = getCustomFlow(name)
    setStyles(customFlow?.styles || null)
  }, [pathname])

  useEffect(() => {
    if (!resolvedTheme) return

    resetStyles()

    const definitions = resolvedTheme === "dark" ? (styles?.dark ?? {}) : (styles?.light ?? {})

    Object.entries(definitions).forEach(([property, value]) => {
      document.body.style.setProperty(property, value)
    })

    return () => {
      resetStyles()
    }
  }, [resolvedTheme, styles])

  return null
}
