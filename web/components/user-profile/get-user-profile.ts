import { getFarcasterUserByEthAddress } from "@/lib/farcaster/get-user"
import { getEthAddress, getShortEthAddress } from "@/lib/utils"
import { Profile as FarcasterProfile } from "@prisma/farcaster"
import { Address } from "viem"
import { unstable_cache } from "next/cache"

export type Profile = {
  address: Address
  display_name: string
  username?: string
  pfp_url?: string
  bio?: string
  fid?: number
}

export const getUserProfile = unstable_cache(
  async (address: Address): Promise<Profile> => {
    const user = await getFarcasterUserByEthAddress(address)
    return transformUser(address, user)
  },
  ["user-profile-v2"],
  { revalidate: 1800 },
)

function transformUser(address: string, profile: FarcasterProfile | null) {
  return {
    address: getEthAddress(address),
    display_name: profile?.display_name || getShortEthAddress(address),
    username: profile?.fname || undefined,
    pfp_url: profile?.avatar_url || undefined,
    bio: profile?.bio || undefined,
    fid: profile?.fid ? Number(profile.fid) : undefined,
  }
}
