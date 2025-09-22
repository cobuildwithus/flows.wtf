import type { Context } from "ponder:registry"
import {
  grants,
  parentFlowToChildren,
  siblingFlowAndParentToPreviousFlowRates,
} from "ponder:schema"

async function getRelevantGrants(db: Context["db"], parentContract: string) {
  const res = await db.find(parentFlowToChildren, { parentFlowContract: parentContract })
  if (!res?.childGrantIds.length) return []

  const grantIds = res.childGrantIds

  const relevantGrants = await Promise.all(
    grantIds.map(async (grantId) => db.find(grants, { id: grantId }))
  )

  // ensure not undefined, throw if any are missing
  if (relevantGrants.some((grant) => !grant)) {
    throw new Error(`Null/undefined grant under parent: ${parentContract}`)
  }

  return relevantGrants.filter((g): g is NonNullable<(typeof relevantGrants)[number]> => Boolean(g))
}

export async function handleIncomingFlowRates(db: Context["db"], parentContract: string) {
  const items = await getRelevantGrants(db, parentContract)
  if (!items?.length) return

  const parent = await db.find(grants, { id: parentContract })
  if (!parent) throw new Error(`Parent not found: ${parentContract}`)

  // Monthly amounts are stored as bigint in schema
  const baselineMonthly = parent.monthlyBaselinePoolFlowRate
  const bonusMonthly = parent.monthlyBonusPoolFlowRate

  // Parent self-units
  const parentBaselineUnits = parent.baselineMemberUnits ?? 0n
  const parentBonusUnits = parent.bonusMemberUnits ?? 0n

  // Sum children units + parent units
  const [totalBaselineUnits, totalBonusUnits] = items.reduce(
    (acc: [bigint, bigint], item) => [
      acc[0] + item.baselineMemberUnits,
      acc[1] + item.bonusMemberUnits,
    ],
    [parentBaselineUnits, parentBonusUnits] as [bigint, bigint]
  )

  const safeDiv = (num: bigint, den: bigint) => (den === 0n ? 0n : num / den)

  await Promise.all(
    items.map(async (sibling) => {
      const baselineUnits = sibling.baselineMemberUnits
      const bonusUnits = sibling.bonusMemberUnits

      const baselineShare = safeDiv(baselineMonthly * baselineUnits, totalBaselineUnits)
      const bonusShare = safeDiv(bonusMonthly * bonusUnits, totalBonusUnits)
      const totalShare = baselineShare + bonusShare

      await db.update(grants, { id: sibling.id }).set({
        monthlyIncomingFlowRate: totalShare,
        monthlyIncomingBaselineFlowRate: baselineShare,
        monthlyIncomingBonusFlowRate: bonusShare,
      })

      await updateSiblingFlowRates(
        db,
        sibling.recipient,
        parentContract,
        totalShare,
        baselineShare,
        bonusShare,
        parent.chainId
      )
    })
  )
}

export async function updateSiblingFlowRates(
  db: Context["db"],
  recipientId: string,
  parentContract: string,
  monthlyIncomingFlowRate: bigint,
  monthlyIncomingBaselineFlowRate: bigint,
  monthlyIncomingBonusFlowRate: bigint,
  chainId: number
) {
  const rid = recipientId.toLowerCase()
  const pid = parentContract.toLowerCase()
  const siblingFlow = await db.find(grants, { id: rid })
  // Only propagate if it is a flow and NOT a direct child of this parent
  if (!siblingFlow || siblingFlow.parentContract.toLowerCase() === pid) return

  const kvKey = `${chainId}_${rid}_${pid}`

  const previousFlowRates = await db.find(siblingFlowAndParentToPreviousFlowRates, {
    siblingFlowAndParent: kvKey,
  })

  const prevTotal = BigInt(previousFlowRates?.previousMonthlyIncomingFlowRate ?? "0")
  const prevBase = BigInt(previousFlowRates?.previousMonthlyIncomingBaselineFlowRate ?? "0")
  const prevBonus = BigInt(previousFlowRates?.previousMonthlyIncomingBonusFlowRate ?? "0")

  const netTotal = monthlyIncomingFlowRate - prevTotal
  const netBase = monthlyIncomingBaselineFlowRate - prevBase
  const netBonus = monthlyIncomingBonusFlowRate - prevBonus

  const addClamp = (current: bigint, delta: bigint) => {
    if (delta >= 0n) return current + delta
    const abs = -delta
    return current > abs ? current - abs : 0n
  }

  await db.update(grants, { id: rid }).set((row) => ({
    monthlyIncomingFlowRate: addClamp(row.monthlyIncomingFlowRate, netTotal),
    monthlyIncomingBaselineFlowRate: addClamp(row.monthlyIncomingBaselineFlowRate, netBase),
    monthlyIncomingBonusFlowRate: addClamp(row.monthlyIncomingBonusFlowRate, netBonus),
  }))

  await db
    .insert(siblingFlowAndParentToPreviousFlowRates)
    .values({
      siblingFlowAndParent: kvKey,
      previousMonthlyIncomingFlowRate: monthlyIncomingFlowRate.toString(),
      previousMonthlyIncomingBaselineFlowRate: monthlyIncomingBaselineFlowRate.toString(),
      previousMonthlyIncomingBonusFlowRate: monthlyIncomingBonusFlowRate.toString(),
    })
    .onConflictDoUpdate(() => ({
      previousMonthlyIncomingFlowRate: monthlyIncomingFlowRate.toString(),
      previousMonthlyIncomingBaselineFlowRate: monthlyIncomingBaselineFlowRate.toString(),
      previousMonthlyIncomingBonusFlowRate: monthlyIncomingBonusFlowRate.toString(),
    }))
}
