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
import { PlusIcon } from "@radix-ui/react-icons"
import Image from "next/image"
import Link from "next/link"
import { useRef } from "react"
import { AnimatedSalary } from "../animated-salary"
import { WithdrawSalaryButton } from "../withdraw-salary-button"
import { useUserGrants } from "./use-user-grants"
import SignInWithNeynar from "../signin-with-neynar"
import type { User } from "@/lib/auth/user"

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
  const hasActiveGrants =
    grants.some((grant) => Number(grant.monthlyIncomingFlowRate) > 0) ||
    Number(earnings.claimable) > 0

  if (!hasActiveGrants) {
    return null
  }

  const { isFlowsMember, updatesChannel, hasFarcasterAccount } = data || {}

  const canPostUpdates = !isLoading && !!hasFarcasterAccount
  const channelLink = updatesChannel
    ? `https://farcaster.xyz/~/compose?text=&channelKey=${updatesChannel}`
    : "https://farcaster.xyz/~/compose?text="

  const needsVerify = !isLoading && !hasFarcasterAccount
  const shouldJoinFlowsChannel = !isLoading && !isFlowsMember && hasFarcasterAccount

  const closePopover = () => closeRef.current?.click()

  return (
    <Popover>
      <PopoverTrigger>
        <Badge className="h-[26px] rounded-full text-xs md:h-[30px] md:px-2.5 md:text-sm">
          <AnimatedSalary
            value={earnings.claimable ? Number(earnings.claimable) / 1e18 : 0}
            monthlyRate={earnings.monthly}
          />
        </Badge>
      </PopoverTrigger>
      <PopoverContent className="relative flex w-full max-w-[100vw] flex-col overflow-hidden md:mr-8 md:w-[520px]">
        <PopoverClose ref={closeRef} className="hidden" />
        <ScrollArea className="w-full p-2.5 pb-4 md:pb-0">
          <div>
            <div className="flex items-center justify-between space-x-1.5">
              <p className="text-sm text-muted-foreground">
                You&apos;re earning <Currency>{earnings.yearly}</Currency> per year.
              </p>
              {canPostUpdates && (
                <a href={channelLink} target="_blank" rel="noreferrer">
                  <Button size="xs" variant="outline">
                    <PlusIcon className="mr-1.5 size-3" /> Post update
                  </Button>
                </a>
              )}
            </div>
            {hasGrants ? (
              <>
                <div className="mt-6">
                  <div className="mb-2 grid grid-cols-4 gap-2 text-sm font-medium text-muted-foreground">
                    <div className="col-start-3 text-center">Earned</div>
                    <div className="text-center">Claimable</div>
                  </div>
                  {grants.map((grant) => (
                    <div
                      key={grant.id}
                      className="grid grid-cols-4 items-center gap-2 border-t border-border py-2"
                    >
                      <div className="col-span-2 flex items-center space-x-3 overflow-hidden">
                        <Image
                          src={getIpfsUrl(grant.image)}
                          alt={grant.title}
                          className="size-[30px] flex-shrink-0 rounded-full object-cover"
                          width={30}
                          height={30}
                        />
                        <Link
                          href={`/item/${grant.id}`}
                          className="truncate text-base hover:underline"
                          onClick={closePopover}
                        >
                          {grant.title}
                        </Link>
                      </div>
                      <Currency as="div" className="text-center text-base font-medium">
                        {grant.totalEarned}
                      </Currency>
                      <div className="flex items-center justify-center">
                        <WithdrawSalaryButton
                          size="default"
                          builder={address}
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
