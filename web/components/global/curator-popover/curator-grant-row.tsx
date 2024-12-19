import {
  canBeChallenged,
  canDisputeBeExecuted,
  canDisputeBeVotedOn,
  canRequestBeExecuted,
  isDisputeRevealingVotes,
  isDisputeWaitingForVoting,
} from "@/app/components/dispute/helpers"
import { Button } from "@/components/ui/button"
import { DateTime } from "@/components/ui/date-time"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn, getEthAddress, getIpfsUrl } from "@/lib/utils"
import { DownloadIcon } from "@radix-ui/react-icons"
import Image from "next/image"
import Link from "next/link"
import { formatEther } from "viem"
import { ActiveCuratorGrant } from "./hooks/get-user-tcr-tokens"
import { useWithdrawVoterRewards } from "./hooks/use-withdraw-voter-rewards"
import { Status } from "@/lib/enums"

export function ActiveCuratorGrantRow({
  grant,
  closePopover,
}: {
  grant: ActiveCuratorGrant
  closePopover: () => void
}) {
  const { isResolved, title, image, id, challengePeriodEndsAt, disputes } = grant

  const { withdrawRewards, voterRewardsBalance } = useWithdrawVoterRewards(
    getEthAddress(grant.parentArbitrator),
    disputes[0]?.disputeId ? BigInt(disputes[0]?.disputeId) : BigInt(0),
    BigInt(0), // only 1 round for now
  )

  return (
    <div className="grid grid-cols-4 items-center py-2.5">
      <div className="col-span-2 flex items-center space-x-2 overflow-hidden text-ellipsis">
        <Image
          src={getIpfsUrl(image)}
          alt={title}
          className="size-6 flex-shrink-0 rounded-full object-cover max-sm:hidden"
          width={24}
          height={24}
        />
        <Link
          onClick={closePopover}
          href={`/application/${id}`}
          className="truncate text-sm hover:underline"
        >
          {title}
        </Link>
      </div>
      <div className="col-span-2 mr-2.5 flex items-center justify-end space-x-2 overflow-hidden text-ellipsis">
        {canBeChallenged(grant) && (
          <div className="text-xs text-muted-foreground">
            {grant.status === Status.RegistrationRequested ? "Approved" : "Removed"}{" "}
            <b>
              <DateTime date={new Date(challengePeriodEndsAt * 1000)} relative short />
            </b>
          </div>
        )}
        {canRequestBeExecuted(grant) && (
          <Link onClick={closePopover} href={`/application/${id}`}>
            <Button size="xs">Execute</Button>
          </Link>
        )}
        {Boolean(grant.isDisputed) && disputes?.[0] && (
          <>
            {canDisputeBeVotedOn(grant.disputes[0]) && (
              <Link onClick={closePopover} href={`/application/${id}`}>
                <Button variant={grant.disputes[0].votes?.length ? "outline" : "default"} size="xs">
                  {grant.disputes[0].votes?.length ? "Voted" : "Vote"}
                </Button>
              </Link>
            )}
            {isDisputeRevealingVotes(grant.disputes[0]) && (
              <Link
                className="text-xs text-muted-foreground"
                onClick={closePopover}
                href={`/application/${id}`}
              >
                Revealing
              </Link>
            )}
            {isDisputeWaitingForVoting(grant.disputes[0]) && (
              <Link
                className="text-xs text-muted-foreground"
                onClick={closePopover}
                href={`/application/${id}`}
              >
                Voting opens soon
              </Link>
            )}
            {canDisputeBeExecuted(grant.disputes[0]) && (
              <Link onClick={closePopover} href={`/application/${id}`}>
                <Button size="xs">Execute</Button>
              </Link>
            )}
          </>
        )}
        {Boolean(isResolved) && disputes?.[0] && (
          <div
            className={cn("text-xs text-muted-foreground", {
              "text-green-500": disputes[0].votes?.length > 0 && Number(voterRewardsBalance) > 0,
              "text-yellow-500": !disputes[0].votes?.length,
            })}
          >
            {disputes?.[0]?.votes?.length ? (
              <Tooltip>
                <TooltipTrigger className="flex items-center">
                  <Button
                    onClick={() => {
                      withdrawRewards(BigInt(disputes[0].disputeId), BigInt(0))
                    }}
                    size="xs"
                    variant="ghost"
                    disabled={Number(voterRewardsBalance) <= 0}
                  >
                    <div className="text-center text-sm">
                      {Number(formatEther(voterRewardsBalance)).toFixed(2)}
                    </div>
                    <DownloadIcon className="ml-1 size-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {voterRewardsBalance > 0 ? "Withdraw voter rewards" : "Already withdrawn"}
                </TooltipContent>
              </Tooltip>
            ) : (
              <Tooltip>
                <TooltipTrigger>
                  <div className="px-2">Absent</div>
                </TooltipTrigger>
                <TooltipContent>Did not vote in dispute</TooltipContent>
              </Tooltip>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
