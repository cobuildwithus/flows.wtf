import { unstable_cache } from "next/cache"
import database from "@/lib/database/flows-db"

export const getStrategies = unstable_cache(
  async (addresses: string[], chainId: number) => {
    const strategies = await database.allocationStrategy.findMany({
      where: {
        address: { in: addresses.map((a) => a.toLowerCase()) },
        chainId,
      },
    })

    return strategies
  },
  ["getStrategies"],
  { revalidate: 3600 }, // 1 hour in seconds
)
