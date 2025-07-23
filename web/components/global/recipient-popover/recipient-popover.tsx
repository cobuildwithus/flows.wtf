"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Currency } from "@/components/ui/currency"
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { getUserUpdatesChannel } from "@/lib/farcaster/get-user-updates-channel"
import { useServerFunction } from "@/lib/hooks/use-server-function"
import { getEthAddress, getIpfsUrl } from "@/lib/utils"
import Image from "next/image"
import Link from "next/link"
import { useRef } from "react"
import { AnimatedSalary } from "../animated-salary"
import { WithdrawSalaryButton } from "../withdraw-salary-button"
import { useUserGrants } from "./use-user-grants"
import SignInWithNeynar from "../signin-with-neynar"
import type { User } from "@/lib/auth/user"
import { formatEarningsList, getDominantCurrency } from "./group-earnings"

interface Props {
  user: User
}

export const RecipientPopover = (props: Props) => {
  const { user } = props
  const { address } = user
  const { grants, earnings, refetch } = useUserGrants(address)
  const closeRef = useRef<HTMLButtonElement>(null)

  const { data, isLoading } = useServerFunction(getUserUpdatesChannel, "updates-channel", [address])

  const hasGrants = grants.length > 0
  const activeGrants = grants.filter((grant) => Number(grant.monthlyIncomingFlowRate) > 0)
  const hasActiveGrants = activeGrants.length > 0 || Number(earnings.claimable) > 0

  if (!hasActiveGrants) {
    return null
  }

  const { isFlowsMember, hasFarcasterAccount } = data || {}

  const needsVerify = !isLoading && !hasFarcasterAccount
  const shouldJoinFlowsChannel = !isLoading && !isFlowsMember && hasFarcasterAccount

  const closePopover = () => closeRef.current?.click()

  return (
    <Popover>
      <PopoverTrigger>
        <Badge className="h-[26px] rounded-full text-xs md:h-[30px] md:px-2.5 md:text-sm">
          <AnimatedSalary
            grant={getDominantCurrency(grants) ?? undefined}
            value={earnings.claimable ? Number(earnings.claimable) / 1e18 : 0}
            monthlyRate={earnings.monthly}
          />
        </Badge>
      </PopoverTrigger>
      <PopoverContent className="relative flex w-full max-w-[100vw] flex-col overflow-hidden md:mr-8 md:w-[600px]">
        <PopoverClose ref={closeRef} className="hidden" />
        <ScrollArea className="w-full p-2.5 pb-4 md:pb-0">
          <div>
            <div className="flex items-center justify-between space-x-1.5">
              <p className="text-base text-muted-foreground">
                {formatEarningsList(grants)} per year.
              </p>
            </div>
            {hasGrants ? (
              <>
                <div className="mt-10">
                  <div className="mb-2 grid grid-cols-4 gap-2 text-sm font-medium text-muted-foreground">
                    <div className="col-start-3 text-right">Earned</div>
                    <div className="text-center">Claimable</div>
                  </div>
                  {activeGrants.map((grant) => (
                    <div
                      key={grant.id}
                      className="grid grid-cols-4 items-center gap-2 border-t border-border py-4"
                    >
                      <div className="col-span-2 flex items-center space-x-3 overflow-hidden">
                        <Image
                          src={getIpfsUrl(grant.flow.image || grant.image)}
                          alt={grant.title}
                          className="size-[50px] flex-shrink-0 rounded-full object-cover"
                          width={50}
                          height={50}
                        />

                        <div className="flex min-w-0 flex-1 flex-col items-start">
                          <Link
                            href={`/flow/${grant.flow.id}`}
                            className="w-full truncate text-base font-medium text-muted-foreground hover:underline sm:text-lg"
                          >
                            {grant.flow.title}
                          </Link>
                          <Link
                            href={`/item/${grant.id}`}
                            className="w-full truncate text-xs text-muted-foreground hover:underline"
                            onClick={closePopover}
                          >
                            {grant.title}
                          </Link>
                        </div>
                      </div>
                      <Currency
                        display={grant.flow}
                        as="div"
                        compact
                        className="text-right text-lg font-medium"
                      >
                        {grant.totalEarned}
                      </Currency>
                      <div className="items-right flex justify-end">
                        <WithdrawSalaryButton
                          size="lg"
                          builder={address}
                          currencyDisplay={grant.flow}
                          onSuccess={refetch}
                          flow={getEthAddress(grant.parentContract)}
                          pools={[grant.flow.baselinePool, grant.flow.bonusPool].map((pool) =>
                            getEthAddress(pool),
                          )}
                          chainId={grant.flow.chainId}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {needsVerify && (
                  <Alert className="mt-6" variant="default">
                    <AlertDescription>
                      You must connect to Farcaster to keep getting paid.
                      <br />
                      <SignInWithNeynar variant="default" className="mt-2" user={user} />
                    </AlertDescription>
                  </Alert>
                )}
                {shouldJoinFlowsChannel && (
                  <Alert className="mt-6" variant="default">
                    <AlertDescription>
                      Please join the Flows channel on Farcaster to post updates about your work.
                      <br />
                      <Button asChild size="sm" variant="default" className="mt-2">
                        <a
                          href="https://farcaster.xyz/~/channel/flows/join?inviteCode=35EHtdIhE-ivqVxl2SaEFg"
                          target="_blank"
                          rel="noreferrer"
                        >
                          Join /flows
                        </a>
                      </Button>
                    </AlertDescription>
                  </Alert>
                )}
              </>
            ) : (
              <div className="mt-8 flex flex-col items-center justify-center space-x-2 space-y-4 rounded-xl border border-border bg-gray-200/30 py-6 text-sm text-muted-foreground dark:bg-gray-800">
                <Link href="/apply" onClick={closePopover}>
                  <Button size="lg">Apply now</Button>
                </Link>
                <p className="px-2">Apply for funding today and start earning.</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
