"use client"

import { useLogin as usePrivyLogin, useLogout, useConnectWallet } from "@privy-io/react-auth"
import { useRouter } from "next/navigation"
import { useAuthenticated } from "./use-authenticated"
import { useAccount } from "wagmi"

export function useLogin() {
  const router = useRouter()

  const { login } = usePrivyLogin({ onComplete: router.refresh })
  const { logout } = useLogout({ onSuccess: router.refresh })
  const { connectWallet } = useConnectWallet({ onSuccess: router.refresh })
  const { authenticated } = useAuthenticated()
  const { isConnected, address } = useAccount()

  return { login, logout, connectWallet, authenticated, isConnected, address }
}
