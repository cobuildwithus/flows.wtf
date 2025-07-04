import "server-only"

import {
  canDisputeBeExecuted,
  canDisputeBeVotedOn,
  isDisputeRevealingVotes,
  isDisputeWaitingForVoting,
} from "@/app/components/dispute/helpers"
import { DateTime } from "@/components/ui/date-time"
import dynamic from "next/dynamic"
import { ChallengeMessage } from "@/components/ui/challenge-message"
import {
  getGrantFeedbackCasts,
  getGrantFeedbackCastsForFlow,
} from "@/lib/database/queries/get-grant-feedback"
import type { Dispute, Evidence, Grant } from "@prisma/flows"
import { DisputedEvidence } from "./disputed-evidence"
import { DisputeDiscussionLink } from "./dispute-discussion"
import { getAddress } from "viem"

const DisputeExecuteButton = dynamic(() =>
  import("@/app/components/dispute/dispute-execute").then((mod) => mod.DisputeExecuteButton),
)

const VotesTicker = dynamic(() =>
  import("@/app/components/dispute/votes-ticker").then((mod) => mod.VotesTicker),
)

interface Props {
  grant: Grant
  dispute: Dispute & { evidences: Evidence[] }
  flow: Grant
}

export async function StatusDisputed(props: Props) {
  const { dispute, flow, grant } = props

  const currentTime = Date.now() / 1000

  const discussionPosts = grant.isFlow
    ? await getGrantFeedbackCastsForFlow(grant.id)
    : await getGrantFeedbackCasts(grant.id)

  if (isDisputeWaitingForVoting(dispute)) {
    return (
      <div className="space-y-4 text-sm">
        <VotingStartDate />
        <DisputedEvidence grant={grant} dispute={dispute} />
        {discussionPosts && <DisputeDiscussionLink grant={grant} />}
        {!grant.isFlow && <ChallengeMessage />}
      </div>
    )
  }

  if (canDisputeBeVotedOn(dispute) || isDisputeRevealingVotes(dispute)) {
    return (
      <div className="space-y-4 text-sm">
        <DisputedEvidence grant={grant} dispute={dispute} />
        {discussionPosts && <DisputeDiscussionLink grant={grant} />}
        <VotingStartDate />
        <VotingEndDate />
        <RevealDate />
      </div>
    )
  }

  if (canDisputeBeExecuted(dispute) && !!flow.arbitrator) {
    return (
      <div className="space-y-4 text-sm">
        <DisputedEvidence grant={grant} dispute={dispute} />
        <VotingEndDate />
        <Results />
        <DisputeExecuteButton
          flowId={flow.id}
          chainId={flow.chainId}
          arbitrator={getAddress(flow.arbitrator)}
          dispute={dispute}
          className="!mt-6 w-full"
        />
      </div>
    )
  }

  if (dispute.isExecuted) {
    return (
      <div className="space-y-4 text-sm">
        <DisputedEvidence grant={grant} dispute={dispute} />
        <VotingEndDate />
        <Results />
      </div>
    )
  }

  function VotingStartDate() {
    return (
      <div>
        Voting {currentTime < dispute.votingStartTime ? "starts" : "started"}{" "}
        <DateTime
          date={new Date(dispute.votingStartTime * 1000)}
          relative
          className="font-medium"
        />
      </div>
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
    const didArbitrate =
      Number(dispute.challengerPartyVotes) !== Number(dispute.requesterPartyVotes)
    const requesterWon = Number(dispute.challengerPartyVotes) < Number(dispute.requesterPartyVotes)
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
