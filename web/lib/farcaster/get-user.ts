import { farcasterDb } from "@/lib/database/farcaster-edge"
import { getCacheStrategy } from "../database/edge"

export const getFarcasterUserByEthAddress = async (address: `0x${string}`) => {
  try {
    const users = await getFarcasterUsersByEthAddress(address)
    if (!users || users.length === 0) return null

    return users[0]
  } catch (e: any) {
    console.error(e?.message)
    return null
  }
}

export const getFarcasterUsersByEthAddress = async (rawAddress: `0x${string}`) => {
  try {
    const address = rawAddress.toLowerCase()

    const users = await farcasterDb.profile.findMany({
      where: {
        verified_addresses: {
          has: address,
        },
      },
      ...getCacheStrategy(86400),
    })

    return users
  } catch (e: any) {
    console.error(e?.message)
    return []
  }
}

export const getFarcasterUsersByEthAddresses = async (addresses: `0x${string}`[]) => {
  try {
    const lowerAddresses = addresses.map((addr) => addr.toLowerCase())

    const users = await farcasterDb.profile.findMany({
      where: {
        verified_addresses: {
          hasSome: lowerAddresses,
        },
      },
      ...getCacheStrategy(3600),
    })

    return users
  } catch (e: any) {
    console.error(e?.message)
    return []
  }
}

// get by fids
export const getFarcasterUsersByFids = async (fids: bigint[]) => {
  try {
    const users = await farcasterDb.profile.findMany({
      where: { fid: { in: fids } },
      ...getCacheStrategy(3600),
    })

    return users
  } catch (e: any) {
    console.error(e?.message)
    return []
  }
}
