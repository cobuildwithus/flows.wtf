"use server"

import { unstable_cache } from "next/cache"
import database from "@/lib/database/flows-db"
import { NOUNS_FLOW } from "@/lib/config"

export const getPool = unstable_cache(
  async (): Promise<FlowWithTcr> => {
    const pool = await database.grant.findFirstOrThrow({
      where: { id: NOUNS_FLOW },
    })

    return {
      ...pool,
      tcr: pool.tcr as `0x${string}`,
      erc20: pool.erc20 as `0x${string}`,
      tokenEmitter: pool.tokenEmitter as `0x${string}`,
      arbitrator: pool.arbitrator as `0x${string}`,
      allocationStrategies: pool.allocationStrategies as `0x${string}`[],
    }
  },
  ["getPool"],
  { revalidate: 604800 }, // 7 days in seconds
)
