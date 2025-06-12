"use server"

import { l1Client } from "@/lib/viem/client"
import { unstable_cache } from "next/cache"
import { getEnsName, normalize } from "viem/ens"
import { getClient } from "@/lib/viem/client"
import { mainnet } from "viem/chains"

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

// Simple client-side ENS resolution without server caching
export async function resolveEnsToAddress(ensName: string): Promise<string | null> {
  try {
    const normalizedName = normalize(ensName)

    const address = await getClient(mainnet.id).getEnsAddress({
      name: normalizedName,
    })

    return address
  } catch (error) {
    console.error("Failed to resolve ENS name:", ensName, error)
    if (error instanceof Error) {
      console.error("Error details:", error.message)
    }
    return null
  }
}
