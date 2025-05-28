import "server-only"

import {
  canDisputeBeExecuted,
  canDisputeBeVotedOn,
  isDisputeRevealingVotes,
  isDisputeWaitingForVoting,
} from "@/app/components/dispute/helpers"
import { DateTime } from "@/components/ui/date-time"
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible"
import { VotesTicker } from "@/app/components/dispute/votes-ticker"
import { DisputeExecuteButton } from "@/app/components/dispute/dispute-execute"
import { UserProfile } from "@/components/user-profile/user-profile"
import database from "@/lib/database/flows-db"
import { getEthAddress } from "@/lib/utils"
import type { Dispute, Grant, Evidence } from "@prisma/flows"
import { DisputeDiscussionLink } from "@/app/item/[grantId]/components/dispute-discussion"
import { Avatar, AvatarImage } from "@/components/ui/avatar"

interface Props {
  grant: Grant
  dispute: Dispute
  flow: FlowWithTcr
}

export async function ApplicationDisputed(props: Props) {
  const { dispute, flow, grant } = props
  const currentTime = Date.now() / 1000

  const evidenceList = await database.evidence.findMany({
    where: { evidenceGroupID: grant.evidenceGroupID },
    orderBy: { blockNumber: "asc" },
  })

  return (
    <div className="space-y-4 text-sm">
      {isDisputeWaitingForVoting(dispute) && (
        <VotingStartDate dispute={dispute} currentTime={currentTime} />
      )}
      {(canDisputeBeVotedOn(dispute) || isDisputeRevealingVotes(dispute)) && (
        <VotingEndDate dispute={dispute} currentTime={currentTime} />
      )}

      <DisputedEvidence evidenceList={evidenceList} />
      <DisputeDiscussionLink grant={grant} />

      {canDisputeBeExecuted(dispute) && (
        <>
          <VotingEndDate dispute={dispute} currentTime={currentTime} />
          <Results dispute={dispute} grant={grant} />
          <DisputeExecuteButton
            flowId={flow.id}
            arbitrator={flow.arbitrator}
            dispute={dispute}
            className="!mt-6 w-full"
          />
        </>
      )}
      {dispute.isExecuted && (
        <>
          <VotingEndDate dispute={dispute} currentTime={currentTime} />
          <Results dispute={dispute} grant={grant} />
        </>
      )}
    </div>
  )
}

function VotingStartDate({ dispute, currentTime }: { dispute: Dispute; currentTime: number }) {
  return (
    <div>
      Voting {currentTime < dispute.votingStartTime ? "starts" : "started"}{" "}
      <DateTime date={new Date(dispute.votingStartTime * 1000)} relative className="font-medium" />.
    </div>
  )
}

function VotingEndDate({ dispute, currentTime }: { dispute: Dispute; currentTime: number }) {
  return (
    <div>
      Voting {currentTime < dispute.votingEndTime ? "ends" : "ended"}{" "}
      <DateTime date={new Date(dispute.votingEndTime * 1000)} relative className="font-medium" />
      {isDisputeRevealingVotes(dispute) && (
        <>
          . Votes reveal{" "}
          <DateTime
            date={new Date(dispute.revealPeriodEndTime * 1000)}
            relative
            className="font-medium"
          />
        </>
      )}
    </div>
  )
}

function Results({ dispute, grant }: { dispute: Dispute; grant: Grant }) {
  const noDecision = dispute.ruling === 0 && dispute.isExecuted
  const isPending = dispute.ruling === 0
  const isApproved = dispute.ruling === 1
  const didArbitrate = Number(dispute.challengerPartyVotes) !== Number(dispute.requesterPartyVotes)
  const requesterWon = Number(dispute.challengerPartyVotes) < Number(dispute.requesterPartyVotes)
  return (
    <div className="space-y-1">
      <div>
        {dispute.votes} votes cast
        <span className="ml-1.5 text-xs text-muted-foreground">
          ({((100 * Number(dispute.votes)) / Number(dispute.totalSupply)).toFixed(2)}% of{" "}
          {dispute.totalSupply} total supply)
        </span>
      </div>
      {!isPending ? (
        <div>
          Request has been{" "}
          <span className={isApproved ? "text-green-500" : "text-red-500"}>
            {isApproved ? "approved" : "rejected"}
          </span>
        </div>
      ) : !noDecision ? (
        <div>
          Pending{" "}
          {didArbitrate ? (
            <span className={requesterWon ? "text-green-500" : "text-red-500"}>
              {requesterWon ? "approval" : "rejection"}
            </span>
          ) : (
            <span className="text-yellow-500">unresolved</span>
          )}{" "}
          execution
        </div>
      ) : (
        <div>
          <span className="text-yellow-500">Unresolved</span> execution
        </div>
      )}
      {Number(dispute.votes) > 0 && <VotesTicker dispute={dispute} className="!mt-6" />}
    </div>
  )
}

function DisputedEvidence({ evidenceList }: { evidenceList: Evidence[] }) {
  if (!evidenceList || evidenceList.length === 0) return null

  return (
    <ul className="flex flex-col gap-2">
      {evidenceList.map((e) => (
        <Collapsible key={e.id}>
          <CollapsibleTrigger asChild>
            <li className="flex w-full cursor-pointer items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-muted">
              <EvidenceTriggerContent party={e.party} />
            </li>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="max-w-md break-words p-2 text-sm text-muted-foreground">
              {(() => {
                const parts = e.evidence.split(" || ")
                const comment = parts.length > 1 ? parts.slice(1).join(" ") : e.evidence
                return <div className="max-w-full overflow-x-auto break-words">{comment}</div>
              })()}
            </div>
          </CollapsibleContent>
        </Collapsible>
      ))}
    </ul>
  )
}

function EvidenceTriggerContent({ party }: { party: string }) {
  return (
    <UserProfile withPopover={false} hideLink address={getEthAddress(party)}>
      {(profile) => (
        <div className="flex min-w-0 items-center gap-1.5">
          <Avatar className="size-4 lg:size-5">
            <AvatarImage src={profile.pfp_url} alt={profile.display_name} />
          </Avatar>
          <span className="truncate font-medium">{profile.display_name}</span>
          <span className="ml-1 text-sm text-muted-foreground">challenged the application.</span>
        </div>
      )}
    </UserProfile>
  )
}
