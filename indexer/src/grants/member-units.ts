import { ponder, type Context, type Event } from "ponder:registry"
import { handleIncomingFlowRates } from "./lib/handle-incoming-flow-rates"
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

  console.log({ grant })

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
    console.log(recipient.toLowerCase(), parentContract.toLowerCase())
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
          monthlyOutgoingFlowRate: "0",
        })
      : Promise.resolve(),
  ])
}
