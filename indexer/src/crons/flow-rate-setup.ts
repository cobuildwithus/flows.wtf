import { ponder } from "ponder:registry"
import { getAddress } from "viem"
import { superfluidPoolAbi } from "../../abis"
import {
  grants,
  parentFlowToChildren,
  siblingFlowAndParentToPreviousFlowRates,
} from "ponder:schema"
import { isBlockRecent } from "../utils"

const SECONDS_PER_MONTH = 60n * 60n * 24n * 30n

ponder.on("FlowRateSetup:block", async ({ context, event }) => {
  // Only run near tip-of-chain
  if (!isBlockRecent(event.block.timestamp)) return
  const chainId = context.chain.id

  // Load all flows for this chain (parents set includes all flows)
  const parents = await context.db.sql.query.grants.findMany({
    where: (t, { eq, and }) => and(eq(t.chainId, chainId), eq(t.isFlow, true)),
    columns: {
      id: true,
      recipient: true,
      baselinePool: true,
      bonusPool: true,
    },
  })

  console.log(chainId)

  if (!parents.length) return

  const CHUNK_SIZE = 10

  function chunkArray<T>(arr: T[], size: number): T[][] {
    const chunks: T[][] = []
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size))
    }
    return chunks
  }

  type ParentProcessResult = {
    parentId: string
    basePerSec: bigint
    bonusPerSec: bigint
    childTotals: Array<{ childId: string; base: bigint; bonus: bigint }>
  }

  async function processParent(parent: (typeof parents)[number]): Promise<ParentProcessResult> {
    const parentId = parent.id.toLowerCase()
    const baselinePool = parent.baselinePool.toLowerCase() as `0x${string}`
    const bonusPool = parent.bonusPool.toLowerCase() as `0x${string}`

    const childrenRow = await context.db.find(parentFlowToChildren, {
      parentFlowContract: parentId,
    })
    const childIds = childrenRow?.childGrantIds ?? []
    if (!childIds.length) {
      return { parentId, basePerSec: 0n, bonusPerSec: 0n, childTotals: [] }
    }

    const children = await context.db.sql.query.grants.findMany({
      where: (t, { inArray }) => inArray(t.id, childIds),
      columns: {
        id: true,
        recipient: true,
        isFlow: true,
        parentContract: true,
      },
    })

    type PoolCall = {
      address: `0x${string}`
      abi: typeof superfluidPoolAbi
      functionName: "getUnits" | "getMemberFlowRate"
      args: readonly [`0x${string}`]
    }

    const contracts: PoolCall[] = []
    for (const c of children) {
      const to = getAddress(c.recipient)
      contracts.push({
        address: baselinePool,
        abi: superfluidPoolAbi,
        functionName: "getUnits",
        args: [to],
      })
      contracts.push({
        address: baselinePool,
        abi: superfluidPoolAbi,
        functionName: "getMemberFlowRate",
        args: [to],
      })
      contracts.push({
        address: bonusPool,
        abi: superfluidPoolAbi,
        functionName: "getUnits",
        args: [to],
      })
      contracts.push({
        address: bonusPool,
        abi: superfluidPoolAbi,
        functionName: "getMemberFlowRate",
        args: [to],
      })
    }

    const results = (contracts.length
      ? await context.client.multicall({ contracts, allowFailure: true })
      : []) as unknown as { status: "success" | "failure"; result?: unknown }[]

    let idx = 0
    let basePerSec = 0n
    let bonusPerSec = 0n
    const perParentChildTotals = new Map<string, { base: bigint; bonus: bigint }>()

    for (const child of children) {
      const bUnitsRes = results[idx++]
      const bRateRes = results[idx++]
      const xUnitsRes = results[idx++]
      const xRateRes = results[idx++]

      const toBigInt = (v: unknown): bigint => {
        try {
          return BigInt(v as bigint | number | string)
        } catch {
          return 0n
        }
      }

      const bUnits = bUnitsRes?.status === "success" ? toBigInt(bUnitsRes.result) : 0n
      const bRate = bRateRes?.status === "success" ? toBigInt(bRateRes.result) : 0n
      const xUnits = xUnitsRes?.status === "success" ? toBigInt(xUnitsRes.result) : 0n
      const xRate = xRateRes?.status === "success" ? toBigInt(xRateRes.result) : 0n

      if (bRate > 0n) basePerSec += bRate
      if (xRate > 0n) bonusPerSec += xRate

      // Only set units for child under its direct parent
      if (child.parentContract.toLowerCase() === parentId) {
        await context.db.update(grants, { id: child.id }).set({
          baselineMemberUnits: bUnits,
          bonusMemberUnits: xUnits,
          memberUnits: bUnits + xUnits,
        })
      }

      const incBaseMonthly = (bRate > 0n ? bRate : 0n) * SECONDS_PER_MONTH
      const incBonusMonthly = (xRate > 0n ? xRate : 0n) * SECONDS_PER_MONTH
      const incTotalMonthly = incBaseMonthly + incBonusMonthly

      perParentChildTotals.set(child.id, {
        base: (perParentChildTotals.get(child.id)?.base ?? 0n) + incBaseMonthly,
        bonus: (perParentChildTotals.get(child.id)?.bonus ?? 0n) + incBonusMonthly,
      })

      if (child.isFlow && child.parentContract.toLowerCase() !== parentId) {
        const kvKey = `${chainId}_${child.recipient.toLowerCase()}_${parentId}`
        await context.db
          .insert(siblingFlowAndParentToPreviousFlowRates)
          .values({
            siblingFlowAndParent: kvKey,
            previousMonthlyIncomingFlowRate: incTotalMonthly.toString(),
            previousMonthlyIncomingBaselineFlowRate: incBaseMonthly.toString(),
            previousMonthlyIncomingBonusFlowRate: incBonusMonthly.toString(),
          })
          .onConflictDoUpdate(() => ({
            previousMonthlyIncomingFlowRate: incTotalMonthly.toString(),
            previousMonthlyIncomingBaselineFlowRate: incBaseMonthly.toString(),
            previousMonthlyIncomingBonusFlowRate: incBonusMonthly.toString(),
          }))
      }
    }

    return {
      parentId,
      basePerSec,
      bonusPerSec,
      childTotals: Array.from(perParentChildTotals.entries()).map(([childId, v]) => ({
        childId,
        base: v.base,
        bonus: v.bonus,
      })),
    }
  }

  const parentBaselinePerSec = new Map<string, bigint>()
  const parentBonusPerSec = new Map<string, bigint>()
  const childTotals = new Map<string, { base: bigint; bonus: bigint }>()

  const chunks = chunkArray(parents, CHUNK_SIZE)
  for (const chunk of chunks) {
    const results = await Promise.all(chunk.map((p) => processParent(p)))

    for (const r of results) {
      parentBaselinePerSec.set(r.parentId, r.basePerSec)
      parentBonusPerSec.set(r.parentId, r.bonusPerSec)

      for (const ct of r.childTotals) {
        const existing = childTotals.get(ct.childId) ?? { base: 0n, bonus: 0n }
        childTotals.set(ct.childId, {
          base: existing.base + ct.base,
          bonus: existing.bonus + ct.bonus,
        })
      }
    }
  }

  // Replace child monthly incoming with aggregated totals
  if (childTotals.size > 0) {
    const updates: Promise<unknown>[] = []
    for (const [id, { base, bonus }] of childTotals) {
      updates.push(
        context.db.update(grants, { id }).set({
          monthlyIncomingBaselineFlowRate: base,
          monthlyIncomingBonusFlowRate: bonus,
          monthlyIncomingFlowRate: base + bonus,
        })
      )
    }
    await Promise.all(updates)
  }

  // Push parent monthly outflows
  for (const parent of parents) {
    const parentId = parent.id.toLowerCase()
    const basePerSec = parentBaselinePerSec.get(parentId) ?? 0n
    const bonusPerSec = parentBonusPerSec.get(parentId) ?? 0n
    const mBase = basePerSec * SECONDS_PER_MONTH
    const mBonus = bonusPerSec * SECONDS_PER_MONTH
    await context.db.update(grants, { id: parentId }).set({
      monthlyBaselinePoolFlowRate: mBase,
      monthlyBonusPoolFlowRate: mBonus,
      monthlyOutgoingFlowRate: mBase + mBonus,
    })
  }
})
