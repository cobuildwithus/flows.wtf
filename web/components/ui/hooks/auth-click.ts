"use client"

import { useLogin } from "@/lib/auth/use-login"
import React from "react"
import { useAccount } from "wagmi"

type OnConnectCallback = () => void

export function useAuthClick(onConnect?: OnConnectCallback) {
  const { address } = useAccount()
  const { login, connectWallet, authenticated } = useLogin()

  function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    if (!address) {
      e.preventDefault()
      if (!authenticated) {
        login()
      } else {
        connectWallet()
      }
      onConnect?.()
    } else if (!authenticated) {
      e.preventDefault()
      login()
    }

    return e
  }

  return {
    handleClick,
    address,
    authenticated,
  }
}
