import { DateTime } from "@/components/ui/date-time"
import { getUserProfile } from "@/components/user-profile/get-user-profile"
import { TimelineIndicator } from "./timeline-indicator"
import { ProfileLink } from "@/components/user-profile/profile-link"
import Link from "next/link"
import { explorerUrl } from "@/lib/utils"
import { TokenEventData } from "./timeline"

interface Props {
  payment: TokenEventData
  date: Date
}

export async function TokenEvent({ payment, date }: Props) {
  if (!payment.payer || !payment.newlyIssuedTokenCount) return null

  const { beneficiary, payer } = payment

  const [payerProfile, beneficiaryProfile] = await Promise.all([
    getUserProfile(payer as `0x${string}`),
    getUserProfile(beneficiary as `0x${string}`),
  ])

  const amount = payment.newlyIssuedTokenCount.div(10 ** 18)
  const symbol = payment.project?.erc20Symbol || "TOKEN"

  return (
    <>
      <TimelineIndicator image={payerProfile?.pfp_url} />
      <div className="flex w-full flex-col gap-1.5">
        <div className="flex w-full items-center justify-between">
          <p className="text-sm text-muted-foreground">
            <ProfileLink
              address={payment.payer as `0x${string}`}
              username={payerProfile.username}
              className="font-medium text-foreground hover:text-primary"
            >
              {payerProfile.display_name}
            </ProfileLink>{" "}
            bought {amount.toDecimalPlaces(4).toString()} {symbol}
            {payer !== beneficiary && (
              <>
                {` for `}
                <ProfileLink
                  address={beneficiary as `0x${string}`}
                  username={beneficiaryProfile.username}
                  className="font-medium text-foreground hover:text-primary"
                >
                  {beneficiaryProfile.username}
                </ProfileLink>
              </>
            )}
          </p>
          <Link
            href={explorerUrl(payment.txHash || "", payment.chainId, "tx")}
            className="text-xs text-muted-foreground hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            <DateTime date={date} relative short />
          </Link>
        </div>
        {payment.memo && <p className="text-xs italic text-muted-foreground">{payment.memo}</p>}
      </div>
    </>
  )
}
