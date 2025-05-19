import { ponder, type Context, type Event } from "ponder:registry"
import { grants } from "ponder:schema"
import { removeGrantEmbedding } from "../embeddings/embed-grants"
import { isBlockRecent } from "../../utils"
import { getFlow } from "./helpers"
import { getGrantIdFromTcrAndItemId } from "../../tcr/tcr-helpers"

ponder.on("NounsFlowChildren:RecipientRemoved", handleRecipientRemoved)
ponder.on("NounsFlow:RecipientRemoved", handleRecipientRemoved)
ponder.on("RevolutionFlow:RecipientRemoved", handleRecipientRemoved)
ponder.on("RevolutionFlowChildren:RecipientRemoved", handleRecipientRemoved)

async function handleRecipientRemoved(params: {
  event: Event<"NounsFlow:RecipientRemoved">
  context: Context<"NounsFlow:RecipientRemoved">
}) {
  const { event, context } = params
  const { recipientId } = event.args

  const flowAddress = event.log.address.toLowerCase()
  const isRecent = isBlockRecent(Number(event.block.timestamp))

  const flow = await getFlow(context.db, flowAddress)

  if (!flow) throw new Error(`Flow not found: ${flowAddress}`)

  let removedGrantId = recipientId

  if (flow.tcr) {
    removedGrantId = (await getGrantIdFromTcrAndItemId(
      context.db,
      flow.tcr,
      recipientId
    )) as `0x${string}`
  }

  const removedGrant = await context.db.update(grants, { id: removedGrantId }).set({
    isRemoved: true,
    removedAt: Number(event.block.timestamp),
    isActive: false,
    monthlyIncomingFlowRate: "0",
  })

  await Promise.all([
    context.db.update(grants, { id: flow.id }).set({
      activeRecipientCount: flow.activeRecipientCount - 1,
    }),
    isRecent ? removeGrantEmbedding(removedGrant) : Promise.resolve(),
  ])
}
