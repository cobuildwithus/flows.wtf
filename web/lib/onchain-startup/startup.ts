import { cache } from "react"
import database from "../database/flows-db"
import { Accelerator, tryGetAccelerator } from "./data/accelerators"
import { vrbscoffee } from "./data/vrbscoffee"
import { getAllocator } from "../allocation/allocation-data/get-allocator"
import { straystrong } from "./data/straystrong"
import { tropicalbody } from "./data/tropicalbody"
import { flows } from "./data/flows"

const startups = {
  "0xd3758b55916128c88dd7895472a2d47cacb9f208": {
    ...vrbscoffee,
    revnetProjectIds: { base: 104n },
  },
  "0x16f7997240d763e1396e8ad33c8a32dbff708c56": {
    ...straystrong,
    revnetProjectIds: { base: 108n },
  },
  "0x674c0dbe85b3dee2a9cd63fe0dc7d8b9f724335a": {
    ...tropicalbody,
    revnetProjectIds: { base: 112n },
  },
  "0x4c29314870977d7d81e47274762e74f0ebf84037": {
    ...flows,
    revnetProjectIds: { base: 99n },
  },
} as const

const startupIdBySlug = Object.fromEntries(
  Object.entries(startups).map(([id, startup]) => [startup.slug, id]),
) as Record<string, string>

export async function getStartup(id: string) {
  const startup = getStartupData(id)

  const grant = await database.grant.findUniqueOrThrow({
    where: { id, isFlow: true },
  })

  const allocator = await getAllocator(grant.allocationStrategies[0], grant.chainId)

  const accelerator = tryGetAccelerator(grant.parentContract as `0x${string}`)

  return {
    ...grant,
    ...startup,
    accelerator,
    allocator,
    id,
    slug: startup.slug,
  }
}

export function getStartupIdFromSlug(slug: string): string | null {
  const id = startupIdBySlug[slug]
  if (!id) return null

  return id
}

export type Startup = Awaited<ReturnType<typeof getStartup>>

export async function getStartups(accelerator: Accelerator) {
  const startups = await database.grant.findMany({
    where: { parentContract: accelerator.id, isTopLevel: false, isFlow: true },
    include: { flow: true },
  })

  return startups.map((s) => {
    console.log(s.id)
    const startup = getStartupData(s.id)
    return {
      ...s,
      ...startup,
      accelerator,
    }
  })
}

export const getStartupData = cache((id: string) => {
  const startup = startups[id as keyof typeof startups]
  if (!startup) throw new Error("Startup not found")

  return startup
})
