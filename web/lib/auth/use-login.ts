"use client"

import { useLogin as usePrivyLogin, useLogout, useConnectWallet } from "@privy-io/react-auth"
import { useRouter } from "next/navigation"

export function useLogin() {
  const router = useRouter()

  const { login } = usePrivyLogin({ onComplete: router.refresh })
  const { logout } = useLogout({ onSuccess: router.refresh })
  const { connectWallet } = useConnectWallet({ onSuccess: router.refresh })

  return { login, logout, connectWallet }
}
