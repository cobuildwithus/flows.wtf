"use client"

import React, { useCallback, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { handleNeynarSignin } from "@/lib/farcaster/handle-neynar-signin"
import { User } from "@/lib/auth/user"
import {
  NEYNAR_ORIGIN,
  POPUP_CONFIG,
  type NeynarCallbackData,
  validateNeynarClientId,
  validateNeynarCallbackData,
  validateMessageEvent,
  getPopupPosition,
  getWindowFeatures,
  NeynarConnectButton,
  handlePopupBlocked,
  handleInvalidClientId,
  handleNeynarError,
} from "./neynar-utils"
import { toast } from "sonner"

const clientId = process.env.NEXT_PUBLIC_NEYNAR_FLOWS_WTF_CLIENT_ID

interface Props extends React.ComponentPropsWithoutRef<typeof NeynarConnectButton> {
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

  const cleanup = useCallback(() => {
    if (authCheckIntervalRef.current) {
      clearInterval(authCheckIntervalRef.current)
    }
    if (window.__neynarAuthWindow) {
      window.__neynarAuthWindow.close()
      window.__neynarAuthWindow = null
    }
  }, [])

  const handleSignInSuccess = useCallback(
    async (data: NeynarCallbackData) => {
      try {
        if (!validateNeynarCallbackData(data)) {
          throw new Error("Invalid authentication data received")
        }

        await handleNeynarSignin(data.fid, data.signer_uuid, data.signer_permissions, user.address)
        await new Promise((resolve) => setTimeout(resolve, 1000))
        router.refresh()
      } catch (error: any) {
        handleNeynarError(error)
      }
    },
    [user.address, router],
  )

  useEffect(() => {
    let isSubscribed = true

    function handleMessage(event: MessageEvent<NeynarCallbackData>) {
      if (!validateMessageEvent(event, isSubscribed)) {
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
    try {
      cleanup()

      const { width, height } = POPUP_CONFIG
      const { left, top } = getPopupPosition(width, height)
      const loginUrl = new URL(`${NEYNAR_ORIGIN}/login`)

      if (!validateNeynarClientId(clientId)) {
        handleInvalidClientId()
        return
      }

      if (!clientId) {
        throw new Error("Missing client ID")
      }

      loginUrl.searchParams.append("client_id", clientId)

      const windowFeatures = getWindowFeatures(width, height, left, top)
      window.__neynarAuthWindow = window.open(loginUrl.toString(), "_blank", windowFeatures)

      if (!window.__neynarAuthWindow) {
        handlePopupBlocked()
        return
      }

      authCheckIntervalRef.current = setInterval(() => {
        if (window.__neynarAuthWindow?.closed) {
          cleanup()
        }
      }, 1000)
    } catch (error: any) {
      toast.error(error.message || "Failed to open Neynar login window")
    }
  }, [cleanup])

  if (!clientId) {
    console.error("Missing NEXT_PUBLIC_NEYNAR_FLOWS_WTF_CLIENT_ID environment variable")
    return null
  }

  return <NeynarConnectButton onClick={handleClick} className={className} {...buttonProps} />
}
