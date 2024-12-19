import { and, eq } from "ponder"
import { type Context } from "ponder:registry"
import { flowContractToGrantId, grants, parentFlowToChildren } from "ponder:schema"

async function getRelevantGrants(db: Context["db"], parentContract: string) {
  const res = await db.find(parentFlowToChildren, { parentFlowContract: parentContract })
  if (!res?.childGrantIds.length) return []

  const grantIds = res.childGrantIds

  const relevantGrants = await Promise.all(
    grantIds.map(async (grantId) => db.find(grants, { id: grantId }))
  )

  // ensure not null, throw if any are null
  if (relevantGrants.some((grant) => grant === null)) {
    throw new Error(`Null grant found: ${parentContract}`)
  }

  return relevantGrants.filter((grant) => grant !== null)
}

export async function handleIncomingFlowRates(db: Context["db"], parentContract: string) {
  const items = await getRelevantGrants(db, parentContract)

  if (!items?.length) return

  const parentGrantId = await db.find(flowContractToGrantId, { contract: parentContract })
  if (!parentGrantId) throw new Error(`Parent id not found: ${parentContract}`)

  const parent = await db.find(grants, { id: parentGrantId.grantId })
  if (!parent) throw new Error(`Parent not found: ${parentContract}`)

  const secondsPerMonth = 60 * 60 * 24 * 30
  const baselineFlowRate = Number(parent.monthlyBaselinePoolFlowRate) / secondsPerMonth
  const bonusFlowRate = Number(parent.monthlyBonusPoolFlowRate) / secondsPerMonth

  // Calculate total baseline and bonus member units across all siblings
  const [totalBaselineMemberUnits, totalBonusMemberUnits] = items.reduce(
    (acc: [number, number], item) => [
      acc[0] + Number(item.baselineMemberUnits),
      acc[1] + Number(item.bonusMemberUnits),
    ],
    [1, 1] // the parent always has 1 unit directing the pool flow to itself
  )

  if (totalBaselineMemberUnits === 0 || totalBonusMemberUnits === 0) {
    console.error({
      totalBaselineMemberUnits,
      totalBonusMemberUnits,
      baselineFlowRate,
      bonusFlowRate,
    })
    throw new Error("Invalid member units")
  }

  // Calculate flow rate per unit for baseline and bonus pools
  const baselineFlowRatePerUnit = baselineFlowRate / totalBaselineMemberUnits
  const bonusFlowRatePerUnit = bonusFlowRate / totalBonusMemberUnits

  for (const sibling of items) {
    const baselineUnits = Number(sibling.baselineMemberUnits)
    const bonusUnits = Number(sibling.bonusMemberUnits)

    const baselineFlowRate = baselineFlowRatePerUnit * baselineUnits
    const bonusFlowRate = bonusFlowRatePerUnit * bonusUnits
    const totalSiblingFlowRate = baselineFlowRate + bonusFlowRate

    // Convert flow rate to monthly amount
    const monthlyIncomingFlowRate = totalSiblingFlowRate * secondsPerMonth
    const monthlyIncomingBaselineFlowRate = baselineFlowRate * secondsPerMonth
    const monthlyIncomingBonusFlowRate = bonusFlowRate * secondsPerMonth

    if (isNaN(monthlyIncomingFlowRate)) {
      console.error(totalSiblingFlowRate, baselineFlowRate, bonusFlowRate)
      throw new Error(`Invalid monthly incoming flow rate: ${monthlyIncomingFlowRate}`)
    }

    await db.update(grants, { id: sibling.id }).set({
      monthlyIncomingFlowRate: monthlyIncomingFlowRate.toString(),
      monthlyIncomingBaselineFlowRate: monthlyIncomingBaselineFlowRate.toString(),
      monthlyIncomingBonusFlowRate: monthlyIncomingBonusFlowRate.toString(),
    })
  }
}
