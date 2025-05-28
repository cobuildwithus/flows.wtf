import { farcasterDb } from "../database/farcaster"
import { fetchFarcasterUserFromApi } from "./fetch-user-from-api"
import type { Profile } from "@prisma/farcaster"

export const saveNewVerifiedAddress = async (
  fid: number,
  rawAddress: `0x${string}`,
): Promise<Profile> => {
  const address = rawAddress.toLowerCase()

  const profile = await farcasterDb.profile.findUnique({
    where: {
      fid: fid,
    },
  })

  if (!profile) {
    // If no profile in DB (from lag or bug) but we can get one from API, create it
    const fromApi = await fetchFarcasterUserFromApi(fid)
    const newProfile = await createProfile(fromApi, address)
    return newProfile
  }

  if (profile.verified_addresses.includes(address)) return profile

  const updatedProfile = await farcasterDb.profile.update({
    where: {
      fid: fid,
    },
    data: {
      manual_verified_addresses: Array.from(
        new Set([...profile.manual_verified_addresses, address]),
      ),
      verified_addresses: Array.from(new Set([...profile.verified_addresses, address])),
    },
  })

  return updatedProfile
}

async function createProfile(fromApi: Profile, address: string) {
  return farcasterDb.profile.create({
    data: {
      ...fromApi,
      verified_addresses: Array.from(new Set([...fromApi.verified_addresses, address])),
    },
  })
}
