import { DateTime } from "@/components/ui/date-time"
import { getUserProfile } from "@/components/user-profile/get-user-profile"
import { TimelineIndicator } from "./timeline-indicator"
import { ProfileLink } from "@/components/user-profile/profile-link"
import Link from "next/link"
import { TokenEventData } from "@/lib/onchain-startup/types"
import { explorerUrl } from "@/lib/utils"
import { Currency } from "@/components/ui/currency"

interface Props {
  payment: TokenEventData
  date: Date
}

const PAYMENT_GATEWAY_ADDRESS = "0x8292bbac0a2bb14f2f40a68af1fa8fd89fb6fa5b"

export async function TokenEvent({ payment, date }: Props) {
  if (!payment.payer || !payment.newlyIssuedTokenCount) return null

  const { beneficiary, payer } = payment
  const isPaymentGateway = payer.toLowerCase() === PAYMENT_GATEWAY_ADDRESS

  // Get user profiles - if payment gateway, use beneficiary for both
  const [payerProfile, beneficiaryProfile] = await getProfiles(payer, beneficiary, isPaymentGateway)

  const amount = Number(payment.newlyIssuedTokenCount) / 10 ** 18
  const symbol = payment.project?.erc20Symbol || "TOKEN"
  const showBeneficiary = payer !== beneficiary && !isPaymentGateway

  return (
    <>
      <TimelineIndicator image={payerProfile?.pfp_url} />
      <div className="flex w-full flex-col gap-1.5">
        <div className="flex w-full items-center justify-between">
          <p className="text-sm text-muted-foreground">
            <ProfileLink
              address={payment.beneficiary as `0x${string}`}
              username={payerProfile.username}
              className="font-medium text-foreground hover:text-primary"
              chainId={payment.chainId}
            >
              {payerProfile.display_name}
            </ProfileLink>{" "}
            got <Currency flow={{ underlyingTokenSymbol: symbol }}>{amount}</Currency>
            {showBeneficiary && (
              <>
                {` for `}
                <ProfileLink
                  address={beneficiary as `0x${string}`}
                  username={beneficiaryProfile.username}
                  className="font-medium text-foreground hover:text-primary"
                  chainId={payment.chainId}
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

async function getProfiles(payer: string, beneficiary: string, isPaymentGateway: boolean) {
  if (isPaymentGateway) {
    const profile = await getUserProfile(beneficiary as `0x${string}`)
    return [profile, profile]
  }

  return await Promise.all([
    getUserProfile(payer as `0x${string}`),
    getUserProfile(beneficiary as `0x${string}`),
  ])
}
