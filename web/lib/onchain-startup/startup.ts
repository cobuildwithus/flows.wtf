import { cache } from "react"
import database from "../database/flows-db"
import { vrbscoffee } from "./data/vrbscoffee"
import { getAllocator } from "../allocation/allocation-data/get-allocator"
import { straystrong } from "./data/straystrong"
import { tropicalbody } from "./data/tropicalbody"
import { flows } from "./data/flows"
import { base, startupsToJbxBaseProjectId } from "@/addresses"
import { Grant } from "../database/types"
import { StartupData } from "./data/interface"
import { JuiceboxProject, JuiceboxRuleset } from "@prisma/flows"

const startups = {
  "0xd3758b55916128c88dd7895472a2d47cacb9f208": vrbscoffee,
  "0x16f7997240d763e1396e8ad33c8a32dbff708c56": straystrong,
  "0x674c0dbe85b3dee2a9cd63fe0dc7d8b9f724335a": tropicalbody,
  "0x4c29314870977d7d81e47274762e74f0ebf84037": flows,
} as const

const startupIdBySlug = Object.fromEntries(
  Object.entries(startups).map(([id, startup]) => [startup.slug, id]),
) as Record<string, string>

export async function getStartup(id: string) {
  const grant = await database.grant.findUniqueOrThrow({
    where: { id, isFlow: true },
    include: {
      jbxProject: { include: { activeRuleset: true } },
    },
  })

  if (!grant) throw new Error(`Grant ${id} not found`)

  return enrichGrantWithStartupData(grant)
}

export type Startup = Awaited<ReturnType<typeof getStartup>>

export async function getStartups(parentContract: string): Promise<Startup[]> {
  const grants = await database.grant.findMany({
    where: { parentContract, isTopLevel: false, isFlow: true },
    include: {
      jbxProject: { include: { activeRuleset: true } },
    },
  })

  // Enrich all grants with startup data in parallel
  const enrichedStartups = await Promise.all(
    grants.map((grant) => enrichGrantWithStartupData(grant)),
  )

  return enrichedStartups
}

export function getStartupIdFromSlug(slug: string): string | null {
  const id = startupIdBySlug[slug]
  if (!id) return null

  return id
}

export function getAllStartupsWithIds() {
  return Object.entries(startups).map(([id, startup]) => ({
    ...startup,
    jbxProjectId: startupsToJbxBaseProjectId[id as keyof typeof startupsToJbxBaseProjectId],
    id,
  }))
}

const getStartupData = cache((id: string): StartupData | null => {
  const startup = startups[id as keyof typeof startups]

  return startup
})

// Helper function to enrich a grant with startup data
async function enrichGrantWithStartupData(
  grant: Grant & {
    jbxProject: (JuiceboxProject & { activeRuleset: JuiceboxRuleset | null }) | null
  },
) {
  const startup = getStartupData(grant.id)

  const allocator = await getAllocator(grant.allocationStrategies[0], grant.chainId)

  const jbxProject = grant.jbxProject
  const activeRuleset = jbxProject?.activeRuleset ?? null

  const nextPriceIncrease = getNextPriceIncrease(activeRuleset)

  const isBackedByFlows = grant.jbxProject?.accountingToken === base.FlowsToken

  const tokenSymbol = jbxProject?.erc20Symbol ?? ""

  const marketCapUsd =
    (Number(jbxProject?.erc20Supply ?? 0) * Number(grant?.fundraisingTokenUsdPrice ?? 0)) / 1e18

  return {
    ...grant,
    ...startup,
    allocator,
    id: grant.id,
    slug: startup?.slug,
    jbxProject: jbxProject
      ? {
          ...jbxProject,
          balance: Number(jbxProject.balance),
          erc20Supply: Number(jbxProject.erc20Supply),
          pendingReservedTokens: Number(jbxProject.pendingReservedTokens),
          activeRuleset: activeRuleset
            ? {
                ...activeRuleset,
                weight: Number(activeRuleset.weight),
                metadata: Number(activeRuleset.metadata),
              }
            : null,
        }
      : null,
    isBackedByFlows,
    nextPriceIncrease,
    tokenSymbol,
    marketCapUsd,
  }
}

// Helper function to calculate next price increase date
function getNextPriceIncrease(activeRuleset: JuiceboxRuleset | null): Date | null {
  if (!activeRuleset || activeRuleset.duration === BigInt(0)) {
    return null
  }

  const now = Math.floor(Date.now() / 1000)
  const duration = Number(activeRuleset.duration)
  const elapsed = now - Number(activeRuleset.start)
  const cyclesPassed = Math.floor(elapsed / duration)
  const nextCycleStart = Number(activeRuleset.start) + (cyclesPassed + 1) * duration
  const secondsUntilNext = Math.max(nextCycleStart - now, 0)

  if (secondsUntilNext > 0) {
    return new Date((now + secondsUntilNext) * 1000)
  }

  return null
}
