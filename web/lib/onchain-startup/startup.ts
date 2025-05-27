import database from "../database/edge"
import { vrbscoffee } from "./data/vrbscoffee"

const startups = {
  "0x802d57b225d84da0403f7d72c16bead63e21d16f": {
    ...vrbscoffee,
    title: "Vrbs Health AI Coffee",
    revnetProjectIds: {
      base: 3n,
    },
  },
  "0xa1add56e8308175688c2366d69e8fd1bb8567e72": {
    ...vrbscoffee,
    title: "Real Madrid Coffee",
    revnetProjectIds: {
      base: 3n,
    },
  },
} as const

export async function getStartup(id: string) {
  const startup = startups[id as keyof typeof startups]
  if (!startup) throw new Error("Startup not found")

  const grant = await database.grant.findUniqueOrThrow({
    where: { id, isTopLevel: false },
    include: { flow: true },
  })

  if (!grant.allocator) throw new Error("Incorrect startup data - missing allocator")

  return {
    ...grant,
    ...startup,
    allocator: grant.allocator as `0x${string}`,
    id,
  }
}

export type Startup = Awaited<ReturnType<typeof getStartup>>

export function getStartups() {
  return Object.entries(startups).map(([id, startup]) => ({ ...startup, id }))
}
