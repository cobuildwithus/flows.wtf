import { cache } from "react"
import database from "../database/flows-db"
import { Accelerator, getAccelerator } from "./data/accelerators"
import { vrbscoffee } from "./data/vrbscoffee"
import { getAllocator } from "../allocation/allocation-data/get-allocator"
import { straystrong } from "./data/straystrong"

const startups = {
  "0xd3758b55916128c88dd7895472a2d47cacb9f208": {
    ...vrbscoffee,
    title: "Vrbs Coffee",
    revnetProjectIds: { base: 104n },
  },
  "0x16f7997240d763e1396e8ad33c8a32dbff708c56": {
    ...straystrong,
    title: "Stray Strong",
    revnetProjectIds: { base: 104n },
  },
} as const

export async function getStartup(id: string) {
  const startup = getStartupData(id)

  const grant = await database.grant.findUniqueOrThrow({
    where: { id, isTopLevel: false },
    include: { flow: true },
  })

  const allocator = await getAllocator(grant.allocationStrategies[0], grant.chainId)

  const accelerator = getAccelerator(startup.acceleratorId)

  return {
    ...grant,
    ...startup,
    accelerator,
    allocator,
    id,
  }
}

export type Startup = Awaited<ReturnType<typeof getStartup>>

export function getStartups(accelerator: Accelerator) {
  return Object.entries(startups)
    .map(([id, startup]) => ({ ...startup, id, accelerator }))
    .filter((s) => s.acceleratorId === accelerator.id)
}

export const getStartupData = cache((id: string) => {
  const startup = startups[id as keyof typeof startups]
  if (!startup) throw new Error("Startup not found")

  return startup
})
