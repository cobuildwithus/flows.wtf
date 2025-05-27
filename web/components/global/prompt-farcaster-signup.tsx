"use client"

import { useEffect, useState } from "react"
import { useServerFunction } from "@/lib/hooks/use-server-function"
import { getUserUpdatesChannel } from "@/lib/farcaster/get-user-updates-channel"
import { getUserGrants } from "./recipient-popover/get-user-grants"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import SignInWithNeynar from "./signin-with-neynar"
import type { User } from "@/lib/auth/user"

const STORAGE_KEY = "farcaster-signup-prompt-v2"
const ONE_DAY_MS = 24 * 60 * 60 * 1000

interface Props {
  user: User
}

export const PromptFarcasterSignup = ({ user }: Props) => {
  const [open, setOpen] = useState(false)
  const { data: farcasterData, isLoading: isFarcasterLoading } = useServerFunction(
    getUserUpdatesChannel,
    "updates-channel",
    [user.address],
  )
  const { data: grants, isLoading: isGrantsLoading } = useServerFunction(
    getUserGrants,
    "user-grants",
    [user.address],
  )
  const { hasFarcasterAccount } = farcasterData || {}

  useEffect(() => {
    if (isFarcasterLoading || isGrantsLoading) return

    const shouldPrompt = !hasFarcasterAccount && (grants?.length || 0) > 0
    if (!shouldPrompt) return

    const lastShown = localStorage.getItem(STORAGE_KEY)
    const now = Date.now()

    if (!lastShown || now - Number.parseInt(lastShown) >= ONE_DAY_MS) {
      setOpen(true)
      localStorage.setItem(STORAGE_KEY, now.toString())
    }
  }, [isFarcasterLoading, isGrantsLoading, hasFarcasterAccount, grants])

  if (isFarcasterLoading || isGrantsLoading || hasFarcasterAccount || !grants?.length) return null

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Connect Farcaster</DialogTitle>
          <DialogDescription className="pt-4">
            <p className="mb-6">
              You must connect your Farcaster account to participate in Flows and share updates
              about your work.
            </p>
            <div className="flex flex-col gap-4">
              <SignInWithNeynar variant="default" user={user} />
              <p className="text-center text-sm text-muted-foreground">or</p>
              <Button asChild variant="outline">
                <a href="https://farcaster.xyz" target="_blank" rel="noreferrer">
                  Sign up
                </a>
              </Button>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}
