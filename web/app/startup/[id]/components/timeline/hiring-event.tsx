import { DateTime } from "@/components/ui/date-time"
import { Currency } from "@/components/ui/currency"
import { getUserProfile } from "@/components/user-profile/get-user-profile"
import { TimelineIndicator } from "./timeline-indicator"
import { ProfileLink } from "@/components/user-profile/profile-link"
import { base } from "viem/chains"
import { type HiringEvent } from "@/lib/onchain-startup/hiring-events"

interface Props {
  hiringEvent: HiringEvent
  date: Date
}

export async function HiringEvent({ hiringEvent, date }: Props) {
  const profile = await getUserProfile(hiringEvent.recipient as `0x${string}`)

  return (
    <>
      <TimelineIndicator image={profile.pfp_url} />
      <div className="flex w-full items-center justify-between">
        <p className="text-sm text-muted-foreground">
          <ProfileLink
            address={hiringEvent.recipient as `0x${string}`}
            username={profile.username}
            className="font-medium text-foreground hover:text-primary"
            chainId={base.id}
          >
            {profile.display_name}
          </ProfileLink>{" "}
          joined the team -{" "}
          <Currency
            flow={{
              underlyingTokenSymbol: hiringEvent.underlyingTokenSymbol,
              underlyingTokenPrefix: hiringEvent.underlyingTokenPrefix,
            }}
          >
            {hiringEvent.monthlyFlowRate}
          </Currency>
          /mo
        </p>
        <DateTime date={date} relative short className="text-xs text-muted-foreground" />
      </div>
    </>
  )
}
