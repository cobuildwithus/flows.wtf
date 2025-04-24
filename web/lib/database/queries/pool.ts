"use server"

import { unstable_cache } from "next/cache"
import database from "@/lib/database/edge"

export const getPool = unstable_cache(
  async () => {
    return await database.grant.findFirstOrThrow({
      where: { isTopLevel: true, isFlow: true },
    })
  },
  ["getPool"],
  { revalidate: 604800 }, // 7 days in seconds
)
