import { l1Client } from "@/lib/viem/client"
import { unstable_cache } from "next/cache"
import { getEnsName } from "viem/ens"

export const getEnsNameFromAddress = unstable_cache(
  async (address: `0x${string}`): Promise<string | null> => {
    try {
      return await getEnsName(l1Client, { address })
    } catch (error) {
      console.error("Error fetching ENS name:", error)
      return null
    }
  },
  ["ens-name"],
  { revalidate: 259200 }, // 72 hours
)

export const getEnsAvatar = unstable_cache(
  async (ensNameOrAddress: string): Promise<string | null> => {
    try {
      return await l1Client.getEnsAvatar({ name: ensNameOrAddress })
    } catch (error) {
      console.error("Error fetching ENS avatar:", error)
      return null
    }
  },
  ["ens-avatar"],
  { revalidate: 259200 }, // 72 hours
)
