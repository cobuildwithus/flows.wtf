import { ponder, type Context, type Event } from "ponder:registry"
import { grants } from "ponder:schema"

ponder.on("FlowTcr:RequestEvidenceGroupID", handleRequestEvidenceGroupId)
ponder.on("FlowTcrChildren:RequestEvidenceGroupID", handleRequestEvidenceGroupId)

async function handleRequestEvidenceGroupId(params: {
  event: Event<"FlowTcr:RequestEvidenceGroupID">
  context: Context<"FlowTcr:RequestEvidenceGroupID">
}) {
  const { event, context } = params
  const { _itemID, _evidenceGroupID } = event.args

  await context.db.update(grants, { id: _itemID }).set({
    evidenceGroupID: _evidenceGroupID.toString(),
  })
}
