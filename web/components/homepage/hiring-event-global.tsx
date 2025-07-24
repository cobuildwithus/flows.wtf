import { DateTime } from "@/components/ui/date-time"
import { getUserProfile } from "@/components/user-profile/get-user-profile"
import { TimelineIndicator } from "@/app/startup/[id]/components/timeline/timeline-indicator"
import { ProfileLink } from "@/components/user-profile/profile-link"
import Link from "next/link"
import type { HiringEvent } from "@/lib/onchain-startup/hiring-events"
import { base as baseChain } from "viem/chains"

interface Props {
  event: HiringEvent
  date: Date
}

export async function HiringEventGlobal({ event, date }: Props) {
  const profile = await getUserProfile(event.recipient as `0x${string}`)

  return (
    <>
      <TimelineIndicator image={profile.pfp_url} />
      <div className="flex w-full items-center justify-between">
        <p className="text-sm text-muted-foreground">
          <ProfileLink
            address={event.recipient as `0x${string}`}
            username={profile.username}
            chainId={baseChain.id}
            className="font-medium text-foreground hover:text-primary"
          >
            {profile.display_name}
          </ProfileLink>{" "}
          joined{" "}
          <Link href={event.url} className="font-medium text-foreground hover:text-primary">
            {event.startupName}
          </Link>{" "}
        </p>
        <DateTime date={date} relative short className="text-xs text-muted-foreground" />
      </div>
    </>
  )
}
