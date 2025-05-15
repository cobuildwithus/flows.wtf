import { ponder, type Context, type Event } from "ponder:registry"
import {
  grants,
  bonusPoolToGrantId,
  parentFlowToChildren,
  baselinePoolToGrantId,
  recipientAndParentToGrantId,
} from "ponder:schema"
import { updateTcrAndItemId } from "../../tcr/helpers"

ponder.on("NounsFlowChildren:FlowRecipientCreated", handleFlowRecipientCreated)
ponder.on("NounsFlow:FlowRecipientCreated", handleFlowRecipientCreated)

ponder.on("VrbsFlow:FlowRecipientCreated", handleFlowRecipientCreated)
ponder.on("VrbsFlowChildren:FlowRecipientCreated", handleFlowRecipientCreated)

async function handleFlowRecipientCreated(params: {
  event: Event<"VrbsFlow:FlowRecipientCreated">
  context: Context<"VrbsFlow:FlowRecipientCreated">
}) {
  const { event, context } = params
  const timestamp = Number(event.block.timestamp)
  const { recipient, recipientId, baselinePool, bonusPool } = event.args

  const parentFlowContract = event.log.address.toLowerCase() as `0x${string}`
  const submitter = event.transaction.from.toLowerCase() as `0x${string}`
  const flowContract = recipient.toLowerCase() as `0x${string}`

  const grant = await context.db.find(grants, { id: recipientId })

  if (grant) {
    // if the grant was previously added under recipientId via TCR, we need to delete it
    // we want to id grants by their address if they are a flow contract
    await context.db.delete(grants, { id: grant.id })
    await handleTCRMapping(context.db, flowContract, parentFlowContract, recipientId)
  }

  await context.db.update(grants, { id: flowContract }).set({
    updatedAt: timestamp,
    activatedAt: timestamp,
    submitter,
    recipientId,
  })

  await createFlowMappings(context.db, flowContract, bonusPool, baselinePool)
  await createRecipientMappings(context.db, flowContract, parentFlowContract)
}

async function createFlowMappings(
  db: Context["db"],
  flowContract: string,
  bonusPool: string,
  baselinePool: string
) {
  await Promise.all([
    db.insert(bonusPoolToGrantId).values({
      bonusPool: bonusPool.toLowerCase(),
      grantId: flowContract,
    }),
    db.insert(baselinePoolToGrantId).values({
      baselinePool: baselinePool.toLowerCase(),
      grantId: flowContract,
    }),
    db.insert(parentFlowToChildren).values({
      parentFlowContract: flowContract,
      childGrantIds: [],
    }),
  ])
}

async function createRecipientMappings(
  db: Context["db"],
  flowContract: string,
  parentFlowContract: string
) {
  await Promise.all([
    db.insert(recipientAndParentToGrantId).values({
      recipientAndParent: `${flowContract.toLowerCase()}-${parentFlowContract.toLowerCase()}`,
      grantId: flowContract,
    }),

    db.update(parentFlowToChildren, { parentFlowContract }).set((row) => ({
      childGrantIds: [...row.childGrantIds, flowContract],
    })),
  ])
}

async function handleTCRMapping(
  db: Context["db"],
  flowContract: string,
  parentFlowContract: string,
  recipientId: string
) {
  const parent = await db.find(grants, { id: parentFlowContract })
  if (!parent) throw new Error("Parent grant not found")

  if (!parent.tcr) return

  await updateTcrAndItemId(db, parent.tcr, recipientId, flowContract)
}
