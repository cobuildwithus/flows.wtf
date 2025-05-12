import { eq } from "ponder"
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

  const grant = await context.db.sql.query.grants.findFirst({
    where: eq(grants.recipientId, _itemID),
  })
  if (!grant) throw new Error(`Grant not found: ${_itemID}`)

  await context.db.update(grants, { id: grant.id }).set({
    evidenceGroupID: _evidenceGroupID.toString(),
  })
}
