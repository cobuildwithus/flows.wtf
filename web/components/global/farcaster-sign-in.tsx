"use client"
import { User } from "@/lib/auth/user"
import SignInWithNeynar from "./signin-with-neynar"

export function FarcasterSignIn({ user, className }: { user: User; className?: string }) {
  if (user.hasSignerUUID) return null

  return (
    <div className={className}>
      <SignInWithNeynar user={user} />
    </div>
  )
}
