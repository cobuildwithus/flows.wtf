import { ponder, type Context, type Event } from "ponder:registry"
import { updateSiblingFlowRates } from "./lib/handle-incoming-flow-rates"
import {
  baselinePoolToGrantId,
  bonusPoolToGrantId,
  grants,
  parentFlowToChildren,
  recipientAndParentToGrantId,
} from "ponder:schema"

ponder.on("SuperfluidPool:MemberUnitsUpdated", handleMemberUnitsUpdated)

async function handleMemberUnitsUpdated(params: {
  event: Event<"SuperfluidPool:MemberUnitsUpdated">
  context: Context<"SuperfluidPool:MemberUnitsUpdated">
}) {
  const { event, context } = params
  const { newUnits, member } = event.args
  const pool = event.log.address.toLowerCase()
  const ts = Number(event.block.timestamp)

  const parentGrant = await getParentGrant(context.db, pool)

  if (!parentGrant) {
    // this pool is not related to an existing grant, skipping...
    return
  }

  if (parentGrant.recipient === member.toLowerCase()) {
    // This is a flow updating it's member units on itself on initialization, skipping...
    return
  }

  const shouldUpdateBaseline = parentGrant.baselinePool === pool
  const shouldUpdateBonus = parentGrant.bonusPool === pool

  const grant = await getGrant(context.db, member, parentGrant.recipient)

  if (parentGrant.id === grant.id) throw new Error("machine broke")

  if (!grant) {
    throw new Error(`Grant not found: ${member}`)
  }

  const baselineChanged = shouldUpdateBaseline && grant.baselineMemberUnits !== newUnits
  const bonusChanged = shouldUpdateBonus && grant.bonusMemberUnits !== newUnits

  if (baselineChanged || bonusChanged) {
    await context.db.update(grants, { id: grant.id }).set((row) => ({
      baselineMemberUnits: baselineChanged ? newUnits : row.baselineMemberUnits,
      bonusMemberUnits: bonusChanged ? newUnits : row.bonusMemberUnits,
      updatedAt: ts,
    }))
  }

  if (shouldUpdateBaseline && newUnits === 0n) {
    await updateSiblingFlowRates(
      context.db,
      grant.recipient.toLowerCase(),
      parentGrant.recipient.toLowerCase(),
      0n,
      0n,
      0n,
      context.chain.id
    )
    await handleRemovedGrant(context.db, grant.recipient, parentGrant.recipient, grant.isFlow)
  }
}

async function getParentGrant(db: Context["db"], pool: string) {
  const [grantBonus, grantBaseline] = await Promise.all([
    db.find(bonusPoolToGrantId, { bonusPool: pool }),
    db.find(baselinePoolToGrantId, { baselinePool: pool }),
  ])

  if (!grantBonus && !grantBaseline) {
    return null
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

async function handleRemovedGrant(
  db: Context["db"],
  recipient: string,
  parentContract: string,
  isFlow: boolean
) {
  const grant = await getGrant(db, recipient, parentContract)

  await Promise.all([
    db.delete(recipientAndParentToGrantId, {
      recipientAndParent: `${recipient.toLowerCase()}-${parentContract.toLowerCase()}`,
    }),
    db.update(parentFlowToChildren, { parentFlowContract: parentContract }).set((row) => ({
      childGrantIds: row.childGrantIds.filter((id) => id !== grant.id),
    })),
    isFlow
      ? db.update(grants, { id: grant.id }).set({
          monthlyOutgoingFlowRate: 0n,
        })
      : Promise.resolve(),
  ])
}
