"use server"

import database from "@/lib/database/flows-db"
import { unstable_cache } from "next/cache"

export const getFlowsForParent = unstable_cache(
  async (parentContract: `0x${string}`) => {
    if (!parentContract) return []

    const grants = await database.grant.findMany({
      where: { parentContract, isFlow: true },
      omit: { description: true },
    })

    const parent = await database.grant.findFirstOrThrow({
      where: { recipient: parentContract, isFlow: true },
    })

    return [parent, ...grants]
  },
  ["flows-for-parent"],
  { revalidate: 60 }, // 1 minute
)
