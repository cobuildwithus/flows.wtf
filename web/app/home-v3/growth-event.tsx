"use client"

import { DateTime } from "@/components/ui/date-time"
import { ProfileLink } from "@/components/user-profile/profile-link"
import { EthInUsd } from "@/components/global/eth-in-usd"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import Link from "next/link"
import { Currency } from "@/components/ui/currency"
import { type GrowthEvent } from "@/lib/onchain-startup/growth-events"
import { UserProfileClient } from "@/components/user-profile/user-profile-client"

interface Props {
  event: GrowthEvent
}

export function GrowthEvent({ event }: Props) {
  return (
    <UserProfileClient address={event.address as `0x${string}`} withPopover={false} hideLink>
      {(profile) => (
        <div className="flex items-center gap-3">
          {/* Profile Picture */}
          <div className="relative flex-shrink-0">
            <Avatar className="size-8 ring-2 ring-background">
              <AvatarImage src={profile?.pfp_url} alt={profile?.display_name || ""} />
              <AvatarFallback className="text-xs text-muted-foreground">
                {profile?.display_name?.[0] || "?"}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-1.5 text-sm">
              <ProfileLink
                address={event.address as `0x${string}`}
                username={profile?.username}
                className="max-w-[120px] truncate font-medium text-foreground hover:text-primary"
                chainId={event.type === "token-payment" ? event.data.chainId : 8453}
              >
                {profile?.display_name || "Anonymous"}
              </ProfileLink>

              {event.type === "token-payment" ? (
                <>
                  <span className="text-muted-foreground">backed</span>
                  <Link
                    href={`/${event.data.flow.id}`}
                    className="max-w-[130px] truncate font-medium text-foreground hover:text-primary"
                  >
                    {event.data.flow.name}
                  </Link>
                </>
              ) : (
                <>
                  <span className="text-muted-foreground">joined</span>
                  <Link
                    href={`/${event.data.flow.id}`}
                    className="max-w-[130px] truncate font-medium text-foreground hover:text-primary"
                  >
                    {event.data.flow.name}
                  </Link>
                </>
              )}
            </div>

            <div className="flex items-center gap-1 text-xs">
              {event.type === "token-payment" ? (
                <>
                  <span className="font-semibold text-emerald-600">
                    <EthInUsd amount={BigInt(event.data.ethAmount || event.data.amount)} />
                  </span>
                  <span className="text-muted-foreground">•</span>
                </>
              ) : (
                <>
                  <span className="font-semibold text-emerald-600">
                    <Currency flow={event.data.flow}>{event.data.monthlyFlowRate}</Currency>/mo
                  </span>
                  <span className="text-muted-foreground">•</span>
                </>
              )}
              <span className="text-muted-foreground">
                <DateTime date={new Date(event.timestamp * 1000)} relative short />
              </span>
            </div>
          </div>
        </div>
      )}
    </UserProfileClient>
  )
}
