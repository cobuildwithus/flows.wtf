import { ponder, type Context, type Event } from "ponder:registry"
import { Party } from "../enums"
import { disputes, disputeVotes } from "ponder:schema"
import { getDisputePrimaryKey } from "./create"

ponder.on("Arbitrator:VoteCommitted", handleVoteCommitted)
ponder.on("ArbitratorChildren:VoteCommitted", handleVoteCommitted)

ponder.on("Arbitrator:VoteRevealed", handleVoteRevealed)
ponder.on("ArbitratorChildren:VoteRevealed", handleVoteRevealed)

async function handleVoteCommitted(params: {
  event: Event<"Arbitrator:VoteCommitted">
  context: Context<"Arbitrator:VoteCommitted">
}) {
  const { event, context } = params
  const { disputeId, commitHash } = event.args

  const arbitrator = event.log.address.toLowerCase()
  const voter = event.transaction.from.toLowerCase()

  await context.db.insert(disputeVotes).values({
    id: getDisputeVotePrimaryKey(disputeId, arbitrator, voter, commitHash),
    disputeId: disputeId.toString(),
    committedAt: Number(event.block.timestamp),
    commitHash,
    arbitrator,
    voter,
  })
}

function getDisputeVotePrimaryKey(
  disputeId: bigint,
  arbitrator: string,
  voter: string,
  commitHash: string
) {
  return `${disputeId}_${arbitrator.toLowerCase()}_${voter.toLowerCase()}_${commitHash}`
}

async function handleVoteRevealed(params: {
  event: Event<"Arbitrator:VoteRevealed">
  context: Context<"Arbitrator:VoteRevealed">
}) {
  const { event, context } = params
  const { disputeId, commitHash, reason, voter } = event.args

  const votes = event.args.votes / BigInt(1e18)
  const choice = Number(event.args.choice)

  const arbitrator = event.log.address.toLowerCase()
  const revealedBy = event.transaction.from.toLowerCase()
  const dispute = await context.db.find(disputes, {
    id: getDisputePrimaryKey(disputeId, arbitrator),
  })

  if (!dispute) throw new Error("Dispute not found")

  // Update vote
  await context.db
    .update(disputeVotes, {
      id: getDisputeVotePrimaryKey(disputeId, arbitrator, voter, commitHash),
    })
    .set({
      choice,
      votes: votes.toString(),
      reason: reason,
      revealedAt: Number(event.block.timestamp),
      revealedBy: revealedBy.toLowerCase(),
    })

  // Update dispute
  const partyVotes = choice === Party.Requester ? "requesterPartyVotes" : "challengerPartyVotes"

  await context.db.update(disputes, { id: dispute.id }).set({
    votes: (BigInt(dispute.votes) + votes).toString(),
    [partyVotes]: (BigInt(dispute[partyVotes]) + votes).toString(),
  })
}
