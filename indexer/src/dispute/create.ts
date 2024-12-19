import { and, eq } from "ponder"
import { ponder, type Context, type Event } from "ponder:registry"
import { arbitratorToGrantId, disputes, grants } from "ponder:schema"
import { Party } from "../enums"

ponder.on("Arbitrator:DisputeCreated", handleDisputeCreated)
ponder.on("ArbitratorChildren:DisputeCreated", handleDisputeCreated)

ponder.on("FlowTcr:Dispute", handleDispute)
ponder.on("FlowTcrChildren:Dispute", handleDispute)

async function handleDisputeCreated(params: {
  event: Event<"Arbitrator:DisputeCreated">
  context: Context<"Arbitrator:DisputeCreated">
}) {
  const { event, context } = params
  const {
    arbitrable,
    id,
    revealPeriodEndTime,
    totalSupply,
    votingEndTime,
    votingStartTime,
    creationBlock,
    arbitrationCost,
  } = event.args

  const arbitrator = event.log.address.toLowerCase()
  const challenger = event.transaction.from.toLowerCase()

  await context.db.insert(disputes).values({
    id: getDisputePrimaryKey(id, arbitrator),
    disputeId: id.toString(),
    grantId: "",
    evidenceGroupID: "",
    arbitrator,
    challenger,
    arbitrable: arbitrable.toString().toLowerCase(),
    votingStartTime: Number(votingStartTime),
    votingEndTime: Number(votingEndTime),
    revealPeriodEndTime: Number(revealPeriodEndTime),
    totalSupply: (totalSupply / BigInt(1e18)).toString(),
    arbitrationCost: (arbitrationCost / BigInt(1e18)).toString(),
    votes: "0",
    requesterPartyVotes: "0",
    challengerPartyVotes: "0",
    creationBlock: Number(creationBlock),
    ruling: Party.None,
    isExecuted: false,
  })
}

async function handleDispute(params: {
  event: Event<"FlowTcr:Dispute">
  context: Context<"FlowTcr:Dispute">
}) {
  const { event, context } = params
  const { _arbitrator, _disputeID, _itemID, _evidenceGroupID } = event.args

  const arbitrator = _arbitrator.toString().toLowerCase()

  await context.db.update(grants, { id: _itemID.toString() }).set({ isDisputed: true })

  const parent = await context.db.find(arbitratorToGrantId, { arbitrator })
  if (!parent) throw new Error("Arbitrator not found")

  await context.db.update(grants, { id: parent.grantId }).set((row) => ({
    challengedRecipientCount: row.challengedRecipientCount + 1,
    awaitingRecipientCount: row.awaitingRecipientCount - 1,
  }))

  await context.db.update(disputes, { id: getDisputePrimaryKey(_disputeID, arbitrator) }).set({
    grantId: _itemID.toString(),
    evidenceGroupID: _evidenceGroupID.toString(),
  })
}

export function getDisputePrimaryKey(disputeId: bigint, arbitrator: string) {
  return `${disputeId.toString()}_${arbitrator.toLowerCase()}`
}
