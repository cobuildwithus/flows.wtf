"use client"

import { usePrivy } from "@privy-io/react-auth"

export function useAuthenticated() {
  const { ready, authenticated } = usePrivy()

  return { ready, authenticated }
}
