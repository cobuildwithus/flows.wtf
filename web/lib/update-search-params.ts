"use client"

import { useCallback } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

/**
 * Hook to manage URL search parameters
 * @returns Functions to read and update search parameters
 */
export function useQueryParams() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()

  /**
   * Creates a new query string with updated parameters
   * @param name Parameter name to update
   * @param value New value for the parameter
   * @returns Updated query string
   */
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set(name, value)
      return params.toString()
    },
    [searchParams],
  )

  /**
   * Updates a query parameter and navigates to the new URL
   * @param name Parameter name to update
   * @param value New value for the parameter
   * @param options Optional configuration for navigation
   */
  const updateQueryParam = useCallback(
    (name: string, value: string, { replace = true } = {}) => {
      const queryString = createQueryString(name, value)
      if (replace) {
        router.replace(`${pathname}?${queryString}`)
      } else {
        router.push(`${pathname}?${queryString}`)
      }
    },
    [pathname, router, createQueryString],
  )

  return {
    getParam: (name: string) => searchParams.get(name),
    updateQueryParam,
    createQueryString,
  }
}
