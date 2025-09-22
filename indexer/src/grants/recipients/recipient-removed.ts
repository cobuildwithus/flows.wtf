import { ponder, type Context, type Event } from "ponder:registry"
import { grants } from "ponder:schema"
import { getFlow } from "./helpers"
import { getGrantIdFromTcrAndItemId } from "../../tcr/tcr-helpers"
import { getGrantIdFromFlowContractAndRecipientId } from "../grant-helpers"

ponder.on("NounsFlowChildren:RecipientRemoved", handleRecipientRemoved)
ponder.on("NounsFlow:RecipientRemoved", handleRecipientRemoved)
ponder.on("CustomFlow:RecipientRemoved", handleRecipientRemoved)

async function handleRecipientRemoved(params: {
  event: Event<"CustomFlow:RecipientRemoved">
  context: Context<"CustomFlow:RecipientRemoved">
}) {
  const { event, context } = params
  const { recipientId } = event.args

  const flowAddress = event.log.address.toLowerCase()

  const flow = await getFlow(context.db, flowAddress)

  if (!flow) throw new Error(`Flow not found: ${flowAddress}`)

  const removedGrantId = flow.tcr
    ? ((await getGrantIdFromTcrAndItemId(context.db, flow.tcr, recipientId)) as `0x${string}`)
    : await getGrantIdFromFlowContractAndRecipientId(context.db, flowAddress, recipientId)

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
