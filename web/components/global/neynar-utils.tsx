"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import FarcasterLogo from "@/public/farcaster.svg"
import { toast } from "sonner"

export const NEYNAR_ORIGIN = "https://app.neynar.com"

export const POPUP_CONFIG = {
  width: 600,
  height: 700,
  features: ["resizable", "scrollbars", "status"],
} as const

export interface NeynarCallbackData {
  signer_uuid: string
  fid: number
  signer_permissions: string[]
  is_authenticated: boolean
}

export function validateNeynarClientId(clientId: string | undefined): boolean {
  return Boolean(clientId?.match(/^[0-9a-f-]{36}$/i))
}

export function validateNeynarCallbackData(data: NeynarCallbackData): boolean {
  if (!data?.signer_uuid || !data?.fid || !Array.isArray(data?.signer_permissions)) {
    return false
  }

  if (typeof data.fid !== "string" || Number(data.fid) <= 0) {
    return false
  }

  if (typeof data.signer_uuid !== "string" || !data.signer_uuid.match(/^[a-f0-9-]{36}$/i)) {
    return false
  }

  return true
}

export function validateMessageEvent(
  event: MessageEvent<NeynarCallbackData>,
  isSubscribed: boolean,
): boolean {
  return (
    isSubscribed &&
    event.origin === NEYNAR_ORIGIN &&
    event.isTrusted &&
    typeof event.data === "object"
  )
}

export function getPopupPosition(width: number, height: number) {
  const left = Math.max(0, (window.screen.width - width) / 2)
  const top = Math.max(0, (window.screen.height - height) / 2)
  return { left, top }
}

export function getWindowFeatures(width: number, height: number, left: number, top: number) {
  const isDesktop = window.matchMedia("(min-width: 800px)").matches
  const secureFeatures = POPUP_CONFIG.features.join(",")
  return isDesktop
    ? `width=${width},height=${height},top=${top},left=${left},${secureFeatures}`
    : "fullscreen=yes"
}

export function NeynarConnectButton({
  onClick,
  className,
  ...buttonProps
}: React.ComponentPropsWithoutRef<typeof Button>) {
  return (
    <Button
      onClick={onClick}
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

export function handlePopupBlocked() {
  toast.error("Please allow popups for authentication")
}

export function handleInvalidClientId() {
  toast.error("Invalid client configuration")
}

export function handleNeynarError(error: Error) {
  console.error("Neynar sign-in error:", error)
  toast.error(error.message || "Failed to sign in with Neynar")
}
