"use client"

import React, { useCallback, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import FarcasterLogo from "@/public/farcaster.svg"
import { handleNeynarSignin } from "@/lib/farcaster/handle-neynar-signin"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { User } from "@/lib/auth/user"

const clientId = process.env.NEXT_PUBLIC_NEYNAR_FLOWS_WTF_CLIENT_ID
const NEYNAR_ORIGIN = "https://app.neynar.com"
const POPUP_CONFIG = {
  width: 600,
  height: 700,
  features: ["resizable", "scrollbars", "status"],
} as const

interface NeynarCallbackData {
  signer_uuid: string
  fid: number
  signer_permissions: string[]
  is_authenticated: boolean
}

interface Props extends React.ComponentPropsWithoutRef<typeof Button> {
  className?: string
  user: User
}

declare global {
  interface Window {
    __neynarAuthWindow?: Window | null
  }
}

export default function SignInWithNeynar({ className = "", user, ...buttonProps }: Props) {
  const router = useRouter()
  const authCheckIntervalRef = useRef<ReturnType<typeof setInterval>>(null)

  // Clean up function to handle all cleanup tasks
  const cleanup = useCallback(() => {
    if (authCheckIntervalRef.current) {
      clearInterval(authCheckIntervalRef.current)
    }
    if (window.__neynarAuthWindow) {
      window.__neynarAuthWindow.close()
      window.__neynarAuthWindow = null
    }
  }, [])

  // Handle sign-in success with rate limiting and security checks
  const handleSignInSuccess = useCallback(
    async (data: NeynarCallbackData) => {
      try {
        // Validate the data structure
        if (!data?.signer_uuid || !data?.fid || !Array.isArray(data?.signer_permissions)) {
          throw new Error("Invalid authentication data received")
        }

        // Additional security checks
        if (typeof data.fid !== "string" || Number(data.fid) <= 0) {
          throw new Error("Invalid FID received")
        }

        if (typeof data.signer_uuid !== "string" || !data.signer_uuid.match(/^[a-f0-9-]{36}$/i)) {
          throw new Error("Invalid signer UUID format")
        }

        await handleNeynarSignin(data.fid, data.signer_uuid, data.signer_permissions, user.address)

        await new Promise((resolve) => setTimeout(resolve, 1000))

        router.refresh()
      } catch (e: any) {
        console.error("Neynar sign-in error:", e)
        toast.error(e.message || "Failed to sign in with Neynar")
      }
    },
    [user.address, router],
  )

  useEffect(() => {
    let isSubscribed = true

    function handleMessage(event: MessageEvent<NeynarCallbackData>) {
      // Enhanced origin and security checks
      if (
        !isSubscribed ||
        event.origin !== NEYNAR_ORIGIN ||
        !event.isTrusted ||
        typeof event.data !== "object"
      ) {
        return
      }

      if (event.data?.is_authenticated) {
        handleSignInSuccess(event.data)
        cleanup()
      }
    }

    window.addEventListener("message", handleMessage)
    return () => {
      isSubscribed = false
      window.removeEventListener("message", handleMessage)
      cleanup()
    }
  }, [handleSignInSuccess, cleanup])

  const handleClick = useCallback(() => {
    cleanup() // Clean up any existing windows/intervals

    const width = POPUP_CONFIG.width
    const height = POPUP_CONFIG.height
    const left = Math.max(0, (window.screen.width - width) / 2)
    const top = Math.max(0, (window.screen.height - height) / 2)

    const loginUrl = new URL(`${NEYNAR_ORIGIN}/login`)

    // Validate clientId before using
    if (!clientId?.match(/^[0-9a-f-]{36}$/i)) {
      toast.error("Invalid client configuration")
      return
    }

    loginUrl.searchParams.append("client_id", clientId)

    // Security-enhanced window features
    const isDesktop = window.matchMedia("(min-width: 800px)").matches
    const secureFeatures = POPUP_CONFIG.features.join(",")
    const windowFeatures = isDesktop
      ? `width=${width},height=${height},top=${top},left=${left},${secureFeatures}`
      : "fullscreen=yes"

    // Open window and start monitoring
    window.__neynarAuthWindow = window.open(loginUrl.toString(), "_blank", windowFeatures)

    // Check if popup was blocked
    if (!window.__neynarAuthWindow) {
      toast.error("Please allow popups for authentication")
      return
    }

    // Monitor popup window status
    authCheckIntervalRef.current = setInterval(() => {
      if (window.__neynarAuthWindow?.closed) {
        cleanup()
      }
    }, 1000)
  }, [cleanup])

  // Validate required configuration
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
      <Image src={FarcasterLogo} alt="Farcaster" className="h-5 w-auto" priority />
      Connect Farcaster
    </Button>
  )
}
