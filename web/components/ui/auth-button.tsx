"use client"

import { Button, ButtonProps } from "@/components/ui/button"
import { useLogin } from "@/lib/auth/use-login"
import React, { ForwardedRef, forwardRef } from "react"
import { useAccount } from "wagmi"

interface Props extends ButtonProps {
  onConnect?: () => void
}

export const AuthButton = forwardRef(function AuthButton(
  { onConnect, onClick, ...props }: Props,
  ref: ForwardedRef<HTMLButtonElement>,
) {
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
    }

    onClick?.(e)
  }

  return <Button ref={ref} type="button" onClick={handleClick} {...props} />
})
