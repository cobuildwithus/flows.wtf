"use client"

import { User } from "@/lib/auth/user"

import SignInWithNeynar from "./signin-with-neynar"
import { useHasSignerRegistered } from "@/lib/farcaster/useHasSignerUUID"

export function FarcasterSignIn({ user, className }: { user: User; className?: string }) {
  const { hasSignerUUID, isLoading } = useHasSignerRegistered({ fid: user.fid })
  if (hasSignerUUID || isLoading) return null

  return (
    <div className={className}>
      <SignInWithNeynar user={user} />
    </div>
  )
}
