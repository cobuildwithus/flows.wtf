import "server-only"

import { DisputeExecuteButton } from "@/app/components/dispute/dispute-execute"
import { DisputeVoteCta } from "@/app/components/dispute/dispute-vote-cta"
import {
  canBeChallenged,
  canDisputeBeExecuted,
  canDisputeBeVotedOn,
  canRequestBeExecuted,
  isDisputeResolvedForNoneParty,
  isDisputeRevealingVotes,
  isDisputeWaitingForVoting,
  isRequestRejected,
} from "@/app/components/dispute/helpers"
import { RequestExecuteButton } from "@/app/components/dispute/request-execute"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DateTime } from "@/components/ui/date-time"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { UserProfile } from "@/components/user-profile/user-profile"
import database from "@/lib/database/edge"
import { getFlow } from "@/lib/database/queries/flow"
import { Status } from "@/lib/enums"
import { getEthAddress, getIpfsUrl } from "@/lib/utils"
import Link from "next/link"
import Image from "next/image"

interface Props {
  flowId: string
}

export default async function ApplicationsGrantsList(props: Props) {
  const { flowId } = props

  const [flow, grants] = await Promise.all([
    getFlow(flowId),
    database.grant.findMany({
      where: { flowId, status: { in: [Status.RegistrationRequested] } },
      include: { disputes: true },
      omit: { description: true },
    }),
  ])

  if (grants.length === 0) {
    return null
  }
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead colSpan={4}>
            <div className="my-2 flex flex-col space-y-2">
              <h2 className="font-semibold md:text-xl">Applications</h2>
            </div>
          </TableHead>
          <TableHead colSpan={2} className="text-right">
            Status
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {grants.map((grant) => {
          const dispute = grant.disputes[0]
          const isDisputeUnresolved = isDisputeResolvedForNoneParty(dispute)
          const isGrantRejected = isRequestRejected(grant, dispute)

          return (
            <TableRow key={grant.id}>
              <TableCell colSpan={4}>
                <div className="flex items-center space-x-4 py-4">
                  <div className="size-12 flex-shrink-0 md:size-20">
                    <Image
                      src={getIpfsUrl(grant.image)}
                      alt={grant.title}
                      width={80}
                      height={80}
                      className="size-full rounded-md object-cover"
                    />
                  </div>
                  <div className="flex max-w-96 flex-col space-y-2">
                    <Link
                      href={`/application/${grant.id}`}
                      className="line-clamp-1 truncate text-lg font-medium duration-150 ease-in-out hover:text-primary md:whitespace-normal"
                      tabIndex={-1}
                    >
                      {grant.title}
                    </Link>
                    <div className="flex items-center space-x-1.5">
                      <UserProfile
                        address={getEthAddress(grant.isFlow ? grant.submitter : grant.recipient)}
                      >
                        {(profile) => (
                          <div className="flex items-center space-x-1.5">
                            <Avatar className="size-6 bg-accent text-xs">
                              <AvatarImage src={profile.pfp_url} alt={profile.display_name} />
                              <AvatarFallback>
                                {profile.display_name[0].toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm tracking-tight text-muted-foreground">
                              {profile.display_name}
                            </span>
                          </div>
                        )}
                      </UserProfile>
                    </div>
                  </div>
                </div>
              </TableCell>

              <TableCell colSpan={2}>
                <div className="flex flex-row items-center justify-end space-x-4 max-sm:text-xs">
                  {!grant.isDisputed && canRequestBeExecuted(grant) && (
                    <div className="flex flex-col">
                      <strong className="font-medium text-green-600 dark:text-green-500">
                        Approved
                      </strong>
                      <span className="text-xs text-muted-foreground">Can be executed</span>
                    </div>
                  )}

                  {!grant.isDisputed && canBeChallenged(grant) && (
                    <HoverCard>
                      <HoverCardTrigger asChild>
                        <div className="flex flex-col text-right">
                          <strong className="font-medium">Awaiting</strong>

                          <span className="text-xs text-muted-foreground">
                            Approved{" "}
                            <DateTime
                              date={new Date(grant.challengePeriodEndsAt * 1000)}
                              relative
                            />
                          </span>
                        </div>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-80">
                        <p>
                          During this time, anyone can challenge the application. If no one
                          challenges it by the end, the application is approved.
                        </p>
                      </HoverCardContent>
                    </HoverCard>
                  )}

                  {dispute && (
                    <>
                      {(canDisputeBeVotedOn(dispute) || isDisputeWaitingForVoting(dispute)) && (
                        <div className="flex flex-col">
                          <strong className="font-medium text-yellow-600 dark:text-yellow-500">
                            Challenged
                          </strong>
                          <span className="text-xs text-muted-foreground">
                            {isDisputeWaitingForVoting(dispute)
                              ? "Vote starts soon"
                              : "Vote in progress"}
                          </span>
                        </div>
                      )}
                      {isDisputeUnresolved && (
                        <div className="flex flex-col">
                          <strong className="font-medium text-gray-600 dark:text-gray-400">
                            Unresolved
                          </strong>
                          <span className="text-xs text-muted-foreground">
                            Failed to reach decision.
                          </span>
                        </div>
                      )}
                      {isGrantRejected && (
                        <div className="flex flex-col">
                          <strong className="font-medium text-gray-600 dark:text-gray-400">
                            Not approved
                          </strong>
                          <span className="text-xs text-muted-foreground">
                            Application not approved
                          </span>
                        </div>
                      )}
                      {isDisputeRevealingVotes(dispute) && (
                        <div className="flex flex-col">
                          <strong className="font-medium text-gray-600 dark:text-gray-400">
                            Revealing
                          </strong>
                          <span className="text-xs text-muted-foreground">
                            Votes are being revealed.
                          </span>
                        </div>
                      )}
                      {canDisputeBeExecuted(dispute) && (
                        <div className="flex flex-col">
                          <strong className="font-medium text-green-600 dark:text-green-500">
                            Solved
                          </strong>
                          <span className="text-xs text-muted-foreground">Can be executed</span>
                        </div>
                      )}
                    </>
                  )}
                  <div className="flex min-w-40 justify-end">
                    {canRequestBeExecuted(grant) && (
                      <RequestExecuteButton grant={grant} flow={flow} size="sm" />
                    )}
                    {canBeChallenged(grant) && (
                      <Link href={`/application/${grant.id}`}>
                        <Button type="button" size="md">
                          Review
                        </Button>
                      </Link>
                    )}
                    {dispute && canDisputeBeExecuted(dispute) && (
                      <DisputeExecuteButton flow={flow} dispute={dispute} size="sm" />
                    )}
                    {dispute && !canDisputeBeExecuted(dispute) && (
                      <DisputeVoteCta dispute={dispute} grant={grant} size="sm" />
                    )}
                  </div>
                </div>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
