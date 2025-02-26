"use client"

import SignInWithNeynar from "@/components/global/signin-with-neynar"
import { User } from "@/lib/auth/user"

export function PendingEvaluation({ user }: { user?: User }) {
  const address = user?.address
  const requestFarcasterConnect = !user?.fid

  return (
    <div className="flex h-full w-full flex-col justify-between rounded-xl border bg-card p-6 text-center">
      <div>
        <div className="mb-6 flex items-center space-x-4 max-lg:justify-center">
          <div className="relative size-12">
            <svg className="size-full" viewBox="0 0 100 100">
              <circle
                className="fill-muted/30 stroke-yellow-500 dark:stroke-yellow-400"
                strokeWidth="6"
                cx="50"
                cy="50"
                r="45"
              />
            </svg>
          </div>
          <span className="font-medium">Pending Grade</span>
        </div>
        <div className="space-y-4">
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              Grades will show once {address ? "your project" : "the project"} is graded by our
              system.
            </p>
            <p>This happens after you post an update on Farcaster.</p>
          </div>
        </div>
      </div>
      {requestFarcasterConnect && address && (
        <div className="mt-8">
          <SignInWithNeynar user={user} />
        </div>
      )}
    </div>
  )
}
