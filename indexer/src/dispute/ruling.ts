import { ponder, type Context, type Event } from "ponder:registry"
import { disputes } from "ponder:schema"
import { and, eq } from "ponder"
import { getDisputePrimaryKey } from "./create"

ponder.on("FlowTcr:Ruling", handleRuling)
ponder.on("FlowTcrChildren:Ruling", handleRuling)

async function handleRuling(params: {
  event: Event<"FlowTcr:Ruling">
  context: Context<"FlowTcr:Ruling">
}) {
  const { event, context } = params
  const { _arbitrator, _disputeID, _ruling } = event.args

  await context.db
    .update(disputes, {
      id: getDisputePrimaryKey(_disputeID, _arbitrator),
    })
    .set({
      ruling: Number(_ruling),
    })
}
