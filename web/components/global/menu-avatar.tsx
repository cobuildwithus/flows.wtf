"use client"

import { Button } from "@/components/ui/button"
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useIsGuest } from "@/lib/auth/use-is-guest"
import { useLogin } from "@/lib/auth/use-login"
import type { User } from "@/lib/auth/user"
import { useDelegatedTokens } from "@/lib/voting/delegated-tokens/use-delegated-tokens"
import { useVotingPower } from "@/lib/voting/use-voting-power"
import { useRef } from "react"
import { Avatar, AvatarImage } from "../ui/avatar"
import { LoginButton } from "./login-button"
import { ModeToggle } from "./mode-toggle"
import { useRunUserJobs } from "@/lib/auth/use-run-user-jobs"
import Link from "next/dist/client/link"
import { AvatarLink } from "./avatar-link"
import { NounsVoter } from "./nouns-voter-section"
import { FarcasterSignIn } from "./farcaster-sign-in"

interface Props {
  user?: User
  hasSession: boolean
}

export const MenuAvatar = (props: Props) => {
  const { user, hasSession } = props
  const { votingPower } = useVotingPower()
  const closeRef = useRef<HTMLButtonElement>(null)
  const { tokens } = useDelegatedTokens(user?.address)
  const { logout } = useLogin()
  useRunUserJobs()

  const isGuest = useIsGuest(user, hasSession)

  return (
    <div className="inline-flex">
      {user && (
        <Popover>
          <PopoverTrigger>
            <div className="flex h-[26px] items-center rounded-full bg-secondary transition-opacity hover:bg-accent md:h-[30px] md:space-x-1.5 md:pr-3">
              <Avatar className="size-[26px] bg-accent text-xs md:size-[30px] md:text-sm">
                <AvatarImage src={user.avatar} alt={user.username} />
              </Avatar>
              <span className="hidden text-xs font-semibold text-secondary-foreground md:block md:min-w-2 md:py-0.5 md:text-sm">
                {votingPower?.toString()}
              </span>
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-full max-w-[100vw] md:mr-8 md:w-[380px]">
            <PopoverClose ref={closeRef} className="hidden" />
            <div className="mb-4 flex items-center justify-between">
              <AvatarLink user={user} />
              <div className="flex items-center space-x-2.5">
                <span className="max-sm:hidden">
                  <ModeToggle />
                </span>
                <Button onClick={logout} size="sm" variant="outline">
                  Logout
                </Button>
              </div>
            </div>
            {tokens.length > 0 ? (
              <NounsVoter votingPower={votingPower} tokenIds={tokens.map((token) => token.id)} />
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  You don&apos;t have any Nouns, which means you can&apos;t vote on flows. You can
                  still get involved:
                </p>
                <div className="flex space-x-2.5">
                  <Button asChild size="sm" className="w-full">
                    <Link href="/apply">Apply for a grant</Link>
                  </Button>
                  <Button asChild size="sm" className="w-full">
                    <Link href="/curate">Become a curator</Link>
                  </Button>
                </div>
              </div>
            )}
            <FarcasterSignIn className="mt-4 border-t border-border pt-4" user={user} />
          </PopoverContent>
        </Popover>
      )}
      {isGuest && <LoginButton />}
    </div>
  )
}
