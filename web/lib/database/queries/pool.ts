"use server"

import { unstable_cache } from "next/cache"
import database from "@/lib/database/edge"

export const getPool = unstable_cache(
  async (): Promise<FlowWithTcr> => {
    const pool = await database.grant.findFirstOrThrow({
      where: { isTopLevel: true, isFlow: true },
    })

    return {
      ...pool,
      tcr: pool.tcr as `0x${string}`,
      erc20: pool.erc20 as `0x${string}`,
      tokenEmitter: pool.tokenEmitter as `0x${string}`,
      arbitrator: pool.arbitrator as `0x${string}`,
    }
  },
  ["getPool"],
  { revalidate: 604800 }, // 7 days in seconds
)
