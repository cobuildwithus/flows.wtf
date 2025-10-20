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
import { juiceboxDb } from "./mock-juicebox-db"

const startups = {
  "0xd3758b55916128c88dd7895472a2d47cacb9f208": vrbscoffee,
  "0x16f7997240d763e1396e8ad33c8a32dbff708c56": straystrong,
  "0x674c0dbe85b3dee2a9cd63fe0dc7d8b9f724335a": tropicalbody,
  "0x4c29314870977d7d81e47274762e74f0ebf84037": flows,
} as const

const startupIdBySlug = Object.fromEntries(
  Object.entries(startups).map(([id, startup]) => [startup.slug, id]),
) as Record<string, string>

type ActiveRulesetLike = Pick<JuiceboxRuleset, "start" | "duration" | "weight" | "metadata">

type RawJuiceboxProject = Partial<JuiceboxProject> & {
  activeRuleset?: ActiveRulesetLike | null
}

const JUICEBOX_PROJECT_SELECT = {
  chainId: true,
  projectId: true,
  createdAt: true,
  paymentsCount: true,
  balance: true,
  isRevnet: true,
  deployer: true,
  owner: true,
  erc20: true,
  erc20Supply: true,
  erc20Name: true,
  erc20Symbol: true,
  cashoutA: true,
  cashoutB: true,
  currentRulesetId: true,
  contributorsCount: true,
  redeemCount: true,
  redeemVolume: true,
  pendingReservedTokens: true,
  metadataUri: true,
  metadata: true,
  name: true,
  infoUri: true,
  logoUri: true,
  coverImageUri: true,
  twitter: true,
  discord: true,
  telegram: true,
  tokens: true,
  domain: true,
  description: true,
  tags: true,
  projectTagline: true,
  suckerGroupId: true,
  accountingToken: true,
  accountingDecimals: true,
  accountingCurrency: true,
  accountingTokenSymbol: true,
  accountingTokenName: true,
  activeRuleset: {
    select: {
      rulesetId: true,
      start: true,
      duration: true,
      weight: true,
      metadata: true,
    },
  },
} as const

export async function getStartup(id: string) {
  const grant = await database.grant.findUniqueOrThrow({
    where: { id, isFlow: true },
  })

  return enrichGrantWithStartupData(grant)
}

export type Startup = Awaited<ReturnType<typeof getStartup>>

export async function getStartups(parentContract: string): Promise<Startup[]> {
  const grants = await database.grant.findMany({
    where: { parentContract, isTopLevel: false, isFlow: true },
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

async function getJuiceboxProjectForGrant(grant: Grant): Promise<RawJuiceboxProject | null> {
  if (!grant.jbxProjectId) return null

  const chainId = grant.jbxChainId ?? base.id

  const project = await juiceboxDb.juiceboxProject.findUnique({
    where: {
      chainId_projectId: {
        chainId,
        projectId: grant.jbxProjectId,
      },
    },
    select: JUICEBOX_PROJECT_SELECT,
  })

  if (!project) return null

  return project as RawJuiceboxProject
}

// Helper function to enrich a grant with startup data
async function enrichGrantWithStartupData(
  grant: Grant & {
    jbxProject?: (JuiceboxProject & { activeRuleset: JuiceboxRuleset | null }) | null
  },
) {
  const startup = getStartupData(grant.id)

  const allocator = await getAllocator(grant.allocationStrategies[0], grant.chainId)

  const rawJbxProject =
    (grant as { jbxProject?: RawJuiceboxProject | null }).jbxProject ??
    (await getJuiceboxProjectForGrant(grant))
  const activeRuleset = (rawJbxProject?.activeRuleset ?? null) as ActiveRulesetLike | null

  const nextPriceIncrease = getNextPriceIncrease(activeRuleset)

  const isBackedByFlows = rawJbxProject?.accountingToken === base.FlowsToken

  const tokenSymbol = rawJbxProject?.erc20Symbol ?? ""

  const marketCapUsd =
    (Number(rawJbxProject?.erc20Supply ?? 0) * Number(grant?.fundraisingTokenUsdPrice ?? 0)) / 1e18

  return {
    ...grant,
    ...startup,
    allocator,
    id: grant.id,
    slug: startup?.slug,
    jbxProject: rawJbxProject
      ? {
          ...rawJbxProject,
          balance: Number(rawJbxProject.balance ?? 0),
          erc20Supply: Number(rawJbxProject.erc20Supply ?? 0),
          pendingReservedTokens: Number(rawJbxProject.pendingReservedTokens ?? 0),
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
function getNextPriceIncrease(activeRuleset: ActiveRulesetLike | null): Date | null {
  if (!activeRuleset) return null

  const now = Math.floor(Date.now() / 1000)
  const duration = Number(activeRuleset.duration)
  if (!Number.isFinite(duration) || duration <= 0) return null

  const start = Number(activeRuleset.start)
  if (!Number.isFinite(start)) return null

  const elapsed = now - start
  const cyclesPassed = Math.floor(elapsed / duration)
  const nextCycleStart = start + (cyclesPassed + 1) * duration
  const secondsUntilNext = Math.max(nextCycleStart - now, 0)

  if (secondsUntilNext > 0) {
    return new Date((now + secondsUntilNext) * 1000)
  }

  return null
}
