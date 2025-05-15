import { eq } from "ponder"
import { ponder, type Context, type Event } from "ponder:registry"
import { grants } from "ponder:schema"
import { getGrantIdFromTcrAndItemId } from "./helpers"

ponder.on("FlowTcr:RequestEvidenceGroupID", handleRequestEvidenceGroupId)
ponder.on("FlowTcrChildren:RequestEvidenceGroupID", handleRequestEvidenceGroupId)

async function handleRequestEvidenceGroupId(params: {
  event: Event<"FlowTcr:RequestEvidenceGroupID">
  context: Context<"FlowTcr:RequestEvidenceGroupID">
}) {
  const { event, context } = params
  const { _itemID, _evidenceGroupID } = event.args
  const tcr = event.log.address.toLowerCase()

  const grantId = await getGrantIdFromTcrAndItemId(context.db, tcr, _itemID)
  if (!grantId) throw new Error(`Grant not found: ${_itemID}`)

  await context.db.update(grants, { id: grantId }).set({
    evidenceGroupID: _evidenceGroupID.toString(),
  })
}
