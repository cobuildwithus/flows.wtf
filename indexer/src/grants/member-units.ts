import { ponder, type Context, type Event } from "ponder:registry"
import { handleIncomingFlowRates } from "./lib/handle-incoming-flow-rates"
import {
  baselinePoolToGrantId,
  bonusPoolToGrantId,
  flowContractToGrantId,
  grants,
  parentFlowToChildren,
  recipientAndParentToGrantId,
} from "ponder:schema"
import { eq, and } from "ponder"

ponder.on("BonusPool:MemberUnitsUpdated", handleMemberUnitsUpdated)
ponder.on("BaselinePool:MemberUnitsUpdated", handleMemberUnitsUpdated)
ponder.on("BaselinePoolChildren:MemberUnitsUpdated", handleMemberUnitsUpdated)
ponder.on("BonusPoolChildren:MemberUnitsUpdated", handleMemberUnitsUpdated)

async function handleMemberUnitsUpdated(params: {
  event: Event<"BonusPool:MemberUnitsUpdated">
  context: Context<"BonusPool:MemberUnitsUpdated">
}) {
  const { event, context } = params
  const { newUnits, member } = event.args
  const pool = event.log.address.toLowerCase()

  const parentGrant = await getParentGrant(context.db, pool)

  if (parentGrant.recipient === member.toLowerCase()) {
    // This is a flow updating it's member units on itself on initialization, skipping...
    return
  }

  const shouldUpdateBaseline = parentGrant.baselinePool === pool
  const shouldUpdateBonus = parentGrant.bonusPool === pool

  const grant = await getGrant(context.db, member, parentGrant.recipient)

  if (!grant) {
    throw new Error(`Grant not found: ${member}`)
  }

  if (shouldUpdateBaseline) {
    await context.db.update(grants, { id: grant.id }).set({
      baselineMemberUnits: newUnits.toString(),
      updatedAt: Number(event.block.timestamp),
    })
  }

  if (shouldUpdateBonus) {
    await context.db.update(grants, { id: grant.id }).set({
      bonusMemberUnits: newUnits.toString(),
      updatedAt: Number(event.block.timestamp),
    })
  }

  await handleIncomingFlowRates(context.db, parentGrant.recipient)

  if (shouldUpdateBaseline && newUnits === 0n) {
    // we assume that if the new units are 0 in the baseline pool, the grant is being removed
    await handleRemovedGrant(context.db, grant.recipient, parentGrant.recipient)
  }
}

async function getParentGrant(db: Context["db"], pool: string) {
  const [grantBonus, grantBaseline] = await Promise.all([
    db.find(bonusPoolToGrantId, { bonusPool: pool }),
    db.find(baselinePoolToGrantId, { baselinePool: pool }),
  ])

  if (!grantBonus && !grantBaseline) {
    throw new Error(`Parent grant not found: ${pool}`)
  }

  if (grantBonus && grantBaseline) {
    throw new Error(`Multiple parent grants found: ${pool}`)
  }

  const grantResult = grantBonus || grantBaseline

  if (!grantResult) {
    throw new Error(`Parent grant result not found: ${pool}`)
  }

  const parent = await db.find(grants, { id: grantResult.grantId })

  if (!parent) {
    throw new Error(`Parent grant not found: ${pool}`)
  }

  return parent
}

async function getGrant(db: Context["db"], recipient: string, parentContract: string) {
  const recipientAndParentLookup = await db.find(recipientAndParentToGrantId, {
    recipientAndParent: `${recipient.toLowerCase()}-${parentContract.toLowerCase()}`,
  })

  if (!recipientAndParentLookup) {
    throw new Error(
      `Recipient and parent lookup not found: ${recipient.toLowerCase()}-${parentContract.toLowerCase()}`
    )
  }

  const grant = await db.find(grants, { id: recipientAndParentLookup.grantId })

  if (!grant) {
    throw new Error(`Grant not found: ${recipient}`)
  }

  return grant
}

async function handleRemovedGrant(db: Context["db"], recipient: string, parentContract: string) {
  const grant = await getGrant(db, recipient, parentContract)

  await Promise.all([
    db.delete(recipientAndParentToGrantId, {
      recipientAndParent: `${recipient.toLowerCase()}-${parentContract.toLowerCase()}`,
    }),
    db.delete(flowContractToGrantId, {
      contract: recipient,
    }),
    db.update(parentFlowToChildren, { parentFlowContract: parentContract }).set((row) => ({
      childGrantIds: row.childGrantIds.filter((id) => id !== grant.id),
    })),
  ])
}
