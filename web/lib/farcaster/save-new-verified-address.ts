import { farcasterDb } from "../database/farcaster-edge"

export const saveNewVerifiedAddress = async (fid: number, rawAddress: `0x${string}`) => {
  try {
    const address = rawAddress.toLowerCase()

    const profile = await farcasterDb.profile.findUnique({
      where: {
        fid: fid,
      },
    })

    if (!profile) throw new Error("Profile not found")

    if (profile.verified_addresses.includes(address)) return

    const users = await farcasterDb.profile.update({
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

    return users
  } catch (e: any) {
    console.error(e?.message)
    return []
  }
}
