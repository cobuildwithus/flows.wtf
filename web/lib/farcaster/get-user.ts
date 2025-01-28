import { farcasterDb } from "@/lib/database/farcaster-edge"
import { Profile as FarcasterProfile } from "@prisma/farcaster"
import { getCacheStrategy } from "../database/edge"

export const getFarcasterUserByEthAddress = async (
  rawAddress: `0x${string}`,
): Promise<FarcasterProfile | null> => {
  try {
    const address = rawAddress.toLowerCase()

    const users = await farcasterDb.profile.findMany({
      where: { verified_addresses: { has: address } },
      orderBy: { updated_at: "desc" },
      ...getCacheStrategy(86400),
    })

    if (!users || users.length === 0) return null

    return convertFarcasterUsers(users)[0]
  } catch (e: any) {
    console.error(e?.message)
    return null
  }
}

// get by fids
export const getFarcasterUsersByFids = async (fids: bigint[]) => {
  try {
    const users = await farcasterDb.profile.findMany({
      where: { fid: { in: fids } },
      orderBy: { updated_at: "desc" },
      ...getCacheStrategy(3600),
    })

    return convertFarcasterUsers(users)
  } catch (e: any) {
    console.error(e?.message)
    return []
  }
}

// if this format
//https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/7e4c77e2-ceb6-4327-d083-cf0d5b624200/rectcrop3
// then remove the rectcrop3 and replace with original
// https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/7e4c77e2-ceb6-4327-d083-cf0d5b624200/
function getFarcasterPfpUrl(url: string | null) {
  if (!url) return null
  return url.replace("/rectcrop3", "/original")
}

function convertFarcasterUsers(users: FarcasterProfile[]): FarcasterProfile[] {
  return users.map((user) => ({
    ...user,
    avatar_url: getFarcasterPfpUrl(user.avatar_url),
  }))
}
