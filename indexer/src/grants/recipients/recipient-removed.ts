import { ponder, type Context, type Event } from "ponder:registry"
import { grants } from "ponder:schema"
import { getFlow } from "./helpers"
import { tryGetGrantIdFromTcrAndItemId } from "../../tcr/tcr-helpers"
import { getGrantIdFromFlowContractAndRecipientId } from "../grant-helpers"

ponder.on("CustomFlow:RecipientRemoved", handleRecipientRemoved)

async function handleRecipientRemoved(params: {
  event: Event<"CustomFlow:RecipientRemoved">
  context: Context<"CustomFlow:RecipientRemoved">
}) {
  const { event, context } = params
  const { recipientId } = event.args

  const flowAddress = event.log.address.toLowerCase()

  const flow = await getFlow(context.db, flowAddress)

  let removedGrantId: string | null = null
  const normalizedRecipientId = recipientId.toLowerCase()
  if (flow.tcr) {
    removedGrantId = await tryGetGrantIdFromTcrAndItemId(context.db, flow.tcr, normalizedRecipientId)
  }
  if (!removedGrantId) {
    removedGrantId = await getGrantIdFromFlowContractAndRecipientId(
      context.db,
      flowAddress,
      normalizedRecipientId
    )
  }

  await context.db.update(grants, { id: removedGrantId }).set({
    isRemoved: true,
    removedAt: Number(event.block.timestamp),
    isActive: false,
    monthlyIncomingFlowRate: 0n,
  })

  await context.db.update(grants, { id: flow.id }).set({
    activeRecipientCount: flow.activeRecipientCount - 1,
  })
}
