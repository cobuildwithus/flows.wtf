"use client"

import React, { useEffect, useCallback } from "react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"

const clientId = process.env.NEXT_PUBLIC_NEYNAR_FLOWS_WTF_CLIENT_ID

interface NeynarSignInResponse {
  fid: number
  username: string
  displayName: string
  pfp: {
    url: string
  }
  signer_uuid: string
}

interface Props {
  onSuccess: (data: NeynarSignInResponse) => void
  className?: string
}

declare global {
  interface Window {
    onSignInSuccess?: (data: NeynarSignInResponse) => void
  }
}

const SignInWithNeynar = ({ onSuccess, className = "" }: Props) => {
  const { theme } = useTheme()
  // Declare callback function for window scope
  const handleSignInSuccess = useCallback(
    (data: NeynarSignInResponse) => {
      onSuccess?.(data)
    },
    [onSuccess],
  )

  useEffect(() => {
    // Add script tag
    const script = document.createElement("script")
    // loading script on demand to avoid adding new packages
    script.src = "https://neynarxyz.github.io/siwn/raw/1.2.0/index.js"
    script.async = true
    document.body.appendChild(script)

    // Add callback to window scope
    window.onSignInSuccess = handleSignInSuccess

    // Cleanup
    return () => {
      document.body.removeChild(script)
      delete window.onSignInSuccess
    }
  }, [handleSignInSuccess])

  if (!clientId) {
    console.error("Missing NEXT_PUBLIC_NEYNAR_FLOWS_WTF_CLIENT_ID environment variable")
    return null
  }

  return (
    <div
      className={cn(
        "neynar_signin inline-flex h-11 w-full items-center justify-center whitespace-nowrap rounded-md border border-input bg-background text-sm font-medium tracking-tight shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50 dark:text-white max-sm:h-8",
        className,
      )}
      data-client_id={clientId}
      data-success-callback="onSignInSuccess"
      data-theme={theme}
      data-permissions="read_write"
      data-variant="farcaster"
      data-height="100%"
      data-width="100%"
      data-logo_size="20px"
      data-border_radius="6px"
      data-font_size="14px"
      data-font_weight="500"
      data-background_color={"transparent"}
      data-color={theme === "dark" ? "#ffffff" : "#000000"}
      data-styles={JSON.stringify({
        border: "1px solid var(--border)",
        transition: "background-color 0.2s ease",
        "&:hover": {
          backgroundColor: theme === "dark" ? "#111111" : "#f9f9f9",
        },
      })}
    />
  )
}

export default SignInWithNeynar
