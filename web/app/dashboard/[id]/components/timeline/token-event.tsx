import { DateTime } from "@/components/ui/date-time"
import { getUserProfile } from "@/components/user-profile/get-user-profile"
import { JuiceboxPayEvent } from "@prisma/flows"
import { TimelineIndicator } from "./timeline-indicator"
import { ProfileLink } from "@/components/user-profile/profile-link"

interface Props {
  payment: Partial<JuiceboxPayEvent> & {
    project?: { erc20Symbol: string | null } | null
  }
  date: Date
}

export async function TokenEvent({ payment, date }: Props) {
  if (!payment.payer || !payment.newlyIssuedTokenCount) return null

  const profile = await getUserProfile(payment.payer as `0x${string}`)

  const amount = payment.newlyIssuedTokenCount.div(10 ** 19)
  const symbol = payment.project?.erc20Symbol || "TOKEN"

  return (
    <>
      <TimelineIndicator image={profile?.pfp_url} />
      <div className="flex w-full items-center justify-between">
        <p className="text-sm text-muted-foreground">
          <ProfileLink
            address={payment.payer as `0x${string}`}
            username={profile.username}
            className="font-medium text-foreground hover:text-primary"
          >
            {profile.display_name}
          </ProfileLink>{" "}
          bought {amount.toDecimalPlaces(4).toString()} ${symbol}
        </p>
        <DateTime date={date} relative short className="text-xs text-muted-foreground" />
      </div>
    </>
  )
}
