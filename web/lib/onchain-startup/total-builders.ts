"use server"

import { unstable_cache } from "next/cache"
import database from "@/lib/database/flows-db"

export const getTotalBuilders = unstable_cache(
  async () => {
    const grants = await database.grant.findMany({
      where: {
        isActive: true,
        isFlow: false,
      },
      select: {
        recipient: true,
      },
    })

    const uniqueBuilders = new Set(grants.map((grant) => grant.recipient))

    return uniqueBuilders.size
  },
  ["total-builders"],
  {
    revalidate: 60 * 5, // 5 minutes
  },
)
