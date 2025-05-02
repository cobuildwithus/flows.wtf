"use client"

import { Button, ButtonProps } from "@/components/ui/button"
import React, { ForwardedRef, forwardRef } from "react"
import { useAuthClick } from "@/components/ui/hooks/auth-click"

interface Props extends ButtonProps {
  onConnect?: () => void
}

export const AuthButton = forwardRef(function AuthButton(
  { onConnect, onClick, ...props }: Props,
  ref: ForwardedRef<HTMLButtonElement>,
) {
  const { handleClick: authHandleClick } = useAuthClick(onConnect)

  function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    authHandleClick(e)
    onClick?.(e)
  }

  return <Button ref={ref} type="button" onClick={handleClick} {...props} />
})
