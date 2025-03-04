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
    (name: string, value: string | null | undefined) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value !== null && value !== undefined && value !== "") {
        params.set(name, value)
      } else {
        // Remove the parameter if the value is empty
        params.delete(name)
      }
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
      const url = queryString ? `${pathname}?${queryString}` : pathname
      if (replace) {
        router.replace(url)
      } else {
        router.push(url)
      }
    },
    [pathname, router, createQueryString],
  )

  return {
    getParam: (name: string) => {
      const value = searchParams.get(name)
      return value === null || value === "" ? null : value
    },
    updateQueryParam,
    createQueryString,
  }
}
