import { getFarcasterUserByEthAddress } from "@/lib/farcaster/get-user"
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

function transformUser(address: string, profile: FarcasterProfile | null) {
  return {
    address: getEthAddress(address),
    display_name: profile?.display_name || getShortEthAddress(address),
    username: profile?.fname || undefined,
    pfp_url: profile?.avatar_url || undefined,
    bio: profile?.bio || undefined,
  }
}
