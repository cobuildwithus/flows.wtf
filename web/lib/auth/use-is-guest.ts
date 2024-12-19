"use client"

import { useEffect, useState } from "react"
import { User } from "./user"
import { getAccessToken } from "@privy-io/react-auth"

export function useIsGuest(user: User | undefined, hasSession: boolean) {
  const [isGuest, setIsGuest] = useState(false)

  useEffect(() => {
    if (user) return setIsGuest(false)
    if (!hasSession) return setIsGuest(true)

    getAccessToken().then((token) => {
      setIsGuest(token === null)
    })
  }, [user, hasSession])

  return isGuest
}
