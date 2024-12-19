import "server-only"

import {
  canDisputeBeExecuted,
  canDisputeBeVotedOn,
  formatEvidence,
  isDisputeRevealingVotes,
  isDisputeWaitingForVoting,
} from "@/app/components/dispute/helpers"
import { DateTime } from "@/components/ui/date-time"
import { UserProfile } from "@/components/user-profile/user-profile"
import database from "@/lib/database/edge"
import { getEthAddress } from "@/lib/utils"
import { Dispute, Grant } from "@prisma/flows"
import dynamic from "next/dynamic"

const DisputeExecuteButton = dynamic(() =>
  import("@/app/components/dispute/dispute-execute").then((mod) => mod.DisputeExecuteButton),
)

const VotesTicker = dynamic(() =>
  import("@/app/components/dispute/votes-ticker").then((mod) => mod.VotesTicker),
)

interface Props {
  grant: Grant
  dispute: Dispute
  flow: Grant
}

export async function StatusDisputed(props: Props) {
  const { dispute, flow, grant } = props

  const currentTime = Date.now() / 1000

  if (isDisputeWaitingForVoting(dispute)) {
    return (
      <div className="space-y-4 text-sm">
        <Challenger />
        <Evidence />
        <VotingStartDate />
        <li>Token holders vote to keep or remove this {grant.isFlow ? "flow" : "grant"}.</li>
      </div>
    )
  }

  if (canDisputeBeVotedOn(dispute) || isDisputeRevealingVotes(dispute)) {
    return (
      <div className="space-y-4 text-sm">
        <Challenger />
        <Evidence />
        <VotingStartDate />
        <VotingEndDate />
        <RevealDate />
      </div>
    )
  }

  if (canDisputeBeExecuted(dispute)) {
    return (
      <div className="space-y-4 text-sm">
        <Challenger />
        <Evidence />
        <VotingEndDate />
        <Results />
        <DisputeExecuteButton flow={flow} dispute={dispute} className="!mt-6 w-full" />
      </div>
    )
  }

  if (dispute.isExecuted) {
    return (
      <div className="space-y-4 text-sm">
        <Challenger />
        <Evidence />
        <VotingEndDate />
        <Results />
      </div>
    )
  }

  async function Challenger() {
    return (
      <li>
        <UserProfile address={getEthAddress(dispute.challenger)}>
          {(profile) => <span className="font-medium">{profile.display_name}</span>}
        </UserProfile>
        <span> requested removal of this {grant.isFlow ? "flow" : "grant"}.</span>
      </li>
    )
  }

  async function Evidence() {
    const evidence = await database.evidence.findFirst({
      where: { evidenceGroupID: grant.evidenceGroupID },
      orderBy: { blockNumber: "asc" },
    })

    if (!evidence) return null

    return <li>{formatEvidence(evidence.evidence)}</li>
  }

  function VotingStartDate() {
    return (
      <li>
        Voting {currentTime < dispute.votingStartTime ? "starts" : "started"}{" "}
        <DateTime
          date={new Date(dispute.votingStartTime * 1000)}
          relative
          className="font-medium"
        />
      </li>
    )
  }

  function VotingEndDate() {
    return (
      <li>
        Voting {currentTime < dispute.votingEndTime ? "ends" : "ended"}{" "}
        <DateTime date={new Date(dispute.votingEndTime * 1000)} relative className="font-medium" />
      </li>
    )
  }

  function RevealDate() {
    return (
      <li>
        Votes reveal period {currentTime < dispute.revealPeriodEndTime ? "ends" : "ended"}{" "}
        <DateTime
          date={new Date(dispute.revealPeriodEndTime * 1000)}
          relative
          className="font-medium"
        />
      </li>
    )
  }

  function Results() {
    const noDecision = dispute.ruling === 0 && dispute.isExecuted
    const isPending = dispute.ruling === 0
    const isApproved = dispute.ruling === 1
    const didArbitrate = dispute.challengerPartyVotes != dispute.requesterPartyVotes
    const requesterWon = dispute.challengerPartyVotes < dispute.requesterPartyVotes
    return (
      <>
        <li>
          {dispute.votes} votes cast
          <span className="ml-1.5 text-xs text-muted-foreground">
            ({((100 * Number(dispute.votes)) / Number(dispute.totalSupply)).toFixed(2)}% of{" "}
            {dispute.totalSupply} total supply)
          </span>
        </li>
        {!isPending ? (
          <li>
            Removal request has been{" "}
            <span className={isApproved ? "text-red-500" : "text-green-500"}>
              {isApproved ? "approved" : "rejected"}
            </span>
          </li>
        ) : !noDecision ? (
          <li>
            Pending{" "}
            {didArbitrate ? (
              <span className={requesterWon ? "text-red-500" : "text-green-500"}>
                {requesterWon ? "remove" : "keep"} {grant.isFlow ? "flow" : "grant"}
              </span>
            ) : (
              <span className="text-yellow-500">unresolved</span>
            )}{" "}
            execution
          </li>
        ) : (
          <li>
            <span className="text-yellow-500">Unresolved</span> execution
          </li>
        )}
        {Number(dispute.votes) > 0 && <VotesTicker dispute={dispute} className="!mt-6" mirrored />}
      </>
    )
  }

  return null
}
