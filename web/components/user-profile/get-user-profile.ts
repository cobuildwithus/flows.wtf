import {
  getFarcasterUserByEthAddress,
  getFarcasterUsersByEthAddresses,
} from "@/lib/farcaster/get-user"
import { getEthAddress, getShortEthAddress } from "@/lib/utils"
import { Profile as FarcasterProfile } from "@prisma/farcaster"
import { Address } from "viem"

export type Profile = {
  address: Address
  display_name: string
  username?: string
  pfp_url?: string
  bio?: string
}

export async function getUserProfile(address: Address): Promise<Profile> {
  const user = await getFarcasterUserByEthAddress(address)
  return transformUser(address, user)
}

export async function getUserProfiles(addresses: Address[]) {
  const profiles = await getFarcasterUsersByEthAddresses(addresses)

  return addresses.map((address) => {
    return transformUser(
      address,
      profiles.find((p) => p.verified_addresses.includes(address)) || null,
    )
  })
}

function transformUser(address: string, profile: FarcasterProfile | null) {
  return {
    address: getEthAddress(address),
    display_name: profile?.display_name || getShortEthAddress(address),
    username: profile?.fname || undefined,
    pfp_url: profile?.avatar_url || undefined,
    bio: profile?.bio || undefined,
  }
}
