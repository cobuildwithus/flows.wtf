"use client"

import React, { useCallback, useEffect } from "react"
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

  // Declare callback function for window scope
  const handleSignInSuccess = useCallback(
    async (data: NeynarCallbackData) => {
      try {
        await handleNeynarSignin(data.fid, data.signer_uuid, data.signer_permissions, user.address)
        // wait 1 sec
        await new Promise((resolve) => setTimeout(resolve, 1000))
        router.refresh()
      } catch (e: any) {
        console.error(e)
        toast.error(e.message || "Failed to sign in with Neynar")
      }
    },
    [user.address],
  )
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.origin !== NEYNAR_ORIGIN || event.isTrusted !== true) return

      if (event.data?.is_authenticated) {
        handleSignInSuccess(event.data)

        if (window.__neynarAuthWindow) {
          window.__neynarAuthWindow.close()
          window.__neynarAuthWindow = null
        }
      }
    }

    window.addEventListener("message", handleMessage)
    return () => {
      window.removeEventListener("message", handleMessage)
      if (window.__neynarAuthWindow) {
        window.__neynarAuthWindow.close()
        window.__neynarAuthWindow = null
      }
    }
  }, [handleSignInSuccess])

  const handleClick = useCallback(() => {
    if (window.__neynarAuthWindow) {
      window.__neynarAuthWindow.close()
    }

    const width = 600
    const height = 700
    const left = window.screen.width / 2 - width / 2
    const top = window.screen.height / 2 - height / 2

    const loginUrl = new URL(`${NEYNAR_ORIGIN}/login`)
    loginUrl.searchParams.append("client_id", clientId || "")

    const isDesktop = window.matchMedia("(min-width: 800px)").matches
    const windowFeatures = `width=${width},height=${height},top=${top},left=${left}`
    const windowOptions = isDesktop ? windowFeatures : "fullscreen=yes"

    window.__neynarAuthWindow = window.open(loginUrl.toString(), "_blank", windowOptions)
  }, [])

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
