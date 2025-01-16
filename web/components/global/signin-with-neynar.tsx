"use client"

import React, { useCallback, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import FarcasterLogo from "@/public/farcaster.svg"

const clientId = process.env.NEXT_PUBLIC_NEYNAR_FLOWS_WTF_CLIENT_ID

interface NeynarCallbackData {
  signer_uuid: string
  fid: number
  signer_permissions: string[]
  is_authenticated: boolean
}

interface Props extends React.ComponentPropsWithoutRef<typeof Button> {
  className?: string
  redirectUri?: string
  onSignInSuccess?: (data: NeynarCallbackData) => void | Promise<void>
}

declare global {
  interface Window {
    onSignInSuccess?: (data: NeynarCallbackData) => void | Promise<void>
  }
}

export default function SignInWithNeynar({
  className = "",
  redirectUri,
  onSignInSuccess,
  ...buttonProps
}: Props) {
  useEffect(() => {
    // Set up global callback
    if (onSignInSuccess) {
      window.onSignInSuccess = onSignInSuccess
    }

    // Cleanup
    return () => {
      window.onSignInSuccess = undefined
    }
  }, [onSignInSuccess])

  const handleClick = useCallback(() => {
    const width = 600
    const height = 700
    const left = window.screen.width / 2 - width / 2
    const top = window.screen.height / 2 - height / 2

    // Construct login URL
    const loginUrl = new URL("https://app.neynar.com/login")
    loginUrl.searchParams.append("client_id", clientId || "")
    if (redirectUri) {
      loginUrl.searchParams.append("redirect_uri", redirectUri)
    }

    // Open popup
    const windowFeatures = `width=${width},height=${height},top=${top},left=${left}`
    window.open(loginUrl.toString(), "_blank", windowFeatures)
  }, [redirectUri])

  if (!clientId) {
    console.error("Missing NEXT_PUBLIC_NEYNAR_FLOWS_WTF_CLIENT_ID environment variable")
    return null
  }

  return (
    <Button
      onClick={handleClick}
      variant="outline"
      size="default"
      className={cn("w-full gap-2", className)}
      {...buttonProps}
    >
      <Image src={FarcasterLogo} alt="Farcaster" className="h-5 w-auto" />
      Connect Farcaster
    </Button>
  )
}
