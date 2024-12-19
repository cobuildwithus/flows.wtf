"use client"

import { useRouter } from "next/navigation"
import { useEffect, useRef } from "react"

export const RefreshOnFocus = () => {
  useRefreshOnFocus()
  return <></>
}

export function useRefreshOnFocus() {
  const router = useRouter()
  const lastRefreshTime = useRef(0)

  useEffect(() => {
    const revalidate = () => {
      if (document.visibilityState === "hidden") return
      const now = Date.now() / 1000
      if (now - lastRefreshTime.current >= 120) {
        router.refresh()
        lastRefreshTime.current = now
      }
    }

    window.addEventListener("visibilitychange", revalidate)

    return () => {
      window.removeEventListener("visibilitychange", revalidate)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
