import { ponder, type Context, type Event } from "ponder:registry"
import { grants } from "ponder:schema"
import { removeGrantEmbedding } from "../embeddings/embed-grants"
import { isBlockRecent } from "../../utils"
import { getParentFlow } from "./helpers"
import { eq } from "ponder"
import { getGrantIdFromTcrAndItemId } from "../../tcr/helpers"

ponder.on("NounsFlowChildren:RecipientRemoved", handleRecipientRemoved)
ponder.on("NounsFlow:RecipientRemoved", handleRecipientRemoved)
ponder.on("VrbsFlow:RecipientRemoved", handleRecipientRemoved)
ponder.on("VrbsFlowChildren:RecipientRemoved", handleRecipientRemoved)

async function handleRecipientRemoved(params: {
  event: Event<"NounsFlow:RecipientRemoved">
  context: Context<"NounsFlow:RecipientRemoved">
}) {
  const { event, context } = params
  const { recipientId } = event.args

  const flowAddress = event.log.address.toLowerCase()
  const isRecent = isBlockRecent(Number(event.block.timestamp))

  const parentFlow = await getParentFlow(context.db, flowAddress)

  if (!parentFlow) throw new Error(`Parent flow not found: ${flowAddress}`)

  let removedGrantId = recipientId

  if (parentFlow.tcr) {
    removedGrantId = (await getGrantIdFromTcrAndItemId(
      context.db,
      parentFlow.tcr,
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
    context.db.update(grants, { id: parentFlow.id }).set({
      activeRecipientCount: parentFlow.activeRecipientCount - 1,
    }),
    isRecent ? removeGrantEmbedding(removedGrant) : Promise.resolve(),
  ])
}
