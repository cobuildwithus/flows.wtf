import { ponder, type Context, type Event } from "ponder:registry"
import { evidence } from "ponder:schema"

ponder.on("FlowTcr:Evidence", handleEvidence)
ponder.on("FlowTcrChildren:Evidence", handleEvidence)

async function handleEvidence(params: {
  event: Event<"FlowTcr:Evidence">
  context: Context<"FlowTcr:Evidence">
}) {
  const { event, context } = params
  const { _arbitrator, _evidenceGroupID, _evidence, _party } = event.args

  const blockNumber = event.block.number
  const arbitrator = _arbitrator.toString().toLowerCase()
  const party = _party.toString().toLowerCase()
  const evidenceGroupID = _evidenceGroupID.toString()

  await context.db.insert(evidence).values({
    id: `${arbitrator}_${blockNumber}_${party}_${evidenceGroupID}`,
    arbitrator,
    evidenceGroupID,
    evidence: _evidence,
    party,
    blockNumber: blockNumber.toString(),
  })
}
