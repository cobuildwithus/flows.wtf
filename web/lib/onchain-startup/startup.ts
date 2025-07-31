import { cache } from "react"
import database from "../database/flows-db"
import { vrbscoffee } from "./data/vrbscoffee"
import { getAllocator } from "../allocation/allocation-data/get-allocator"
import { straystrong } from "./data/straystrong"
import { tropicalbody } from "./data/tropicalbody"
import { flows } from "./data/flows"
import { getJuiceboxProjectForStartup } from "../juicebox/get-juicebox-project"
import { base } from "@/addresses"
import { Grant } from "../database/types"
import { StartupData } from "./data/interface"

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
  })

  return enrichGrantWithStartupData(grant)
}

export type Startup = Awaited<ReturnType<typeof getStartup>>

export async function getStartups(parentContract: string): Promise<Startup[]> {
  const grants = await database.grant.findMany({
    where: { parentContract, isTopLevel: false, isFlow: true },
    include: { flow: true },
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
    id,
  }))
}

const getStartupData = cache((id: string): StartupData | null => {
  const startup = startups[id as keyof typeof startups]

  return startup
})

// Helper function to enrich a grant with startup data
async function enrichGrantWithStartupData(grant: Grant) {
  const startup = getStartupData(grant.id)
  const revnet = startup?.revnetProjectId

  const [allocator, jbxProject] = await Promise.all([
    getAllocator(grant.allocationStrategies[0], grant.chainId),
    revnet ? getJuiceboxProjectForStartup(grant.chainId, Number(revnet)) : null,
  ])

  const isBackedByFlows = jbxProject?.accountingToken === base.FlowsToken

  return {
    ...grant,
    ...startup,
    allocator,
    id: grant.id,
    slug: startup?.slug,
    jbxProject,
    isBackedByFlows,
  }
}
