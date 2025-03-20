import "server-only"

import { cookies, headers } from "next/headers"
import { cache } from "react"
import { getFarcasterUserByEthAddress } from "../farcaster/get-user"
import { getEnsAvatar, getEnsNameFromAddress } from "./ens"
import { hasSignerUUID } from "./farcaster-signer-uuid"
import { getUserAddressFromCookie } from "./get-user-from-cookie"

export type User = {
  address: `0x${string}`
  username: string
  avatar?: string
  fid?: number
  hasSignerUUID?: boolean
  location?: { city: string | null; country: string | null; countryRegion: string | null }
}

export const getUser = cache(async () => {
  const address = await getUserAddressFromCookie()
  if (!address) return undefined

  const headersList = await headers()
  const country = headersList.get("X-Vercel-IP-Country")
  const countryRegion = headersList.get("X-Vercel-IP-Country-Region")
  const city = headersList.get("X-Vercel-IP-City")

  const farcasterUser = await getFarcasterUserByEthAddress(address)
  const fid = Number(farcasterUser?.fid)

  return {
    address,
    username: farcasterUser?.fname || (await getEnsNameFromAddress(address)) || "",
    avatar: farcasterUser?.avatar_url || (await getEnsAvatar(address)) || undefined,
    fid,
    location: { city, country, countryRegion },
    hasSignerUUID: fid ? await hasSignerUUID(fid) : false,
  } satisfies User
})

export const hasSession = async () => Boolean((await cookies()).get("privy-session"))
