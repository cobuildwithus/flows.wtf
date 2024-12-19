import { MAX_GRANTS_PER_USER } from "@/lib/config"
import { countUserActiveGrants } from "@/lib/database/queries/grant"
import { embeddingsDb } from "@/lib/embedding/db"
import { getFarcasterUsersByEthAddress } from "@/lib/farcaster/get-user"
import { getFarcasterUserChannels } from "@/lib/farcaster/get-user-channels"
import { getEthAddress } from "@/lib/utils"
import { headers } from "next/headers"
import { cache } from "react"

export const getUserDataPrompt = cache(async (address?: string) => {
  const { farcasterAccountPrompt, fid } = await getFarcasterAccountPrompt(address)

  const userActiveGrants = await countUserActiveGrants()

  return `## User data
  
  ${address ? `The address of the user is ${address}. ` : "The user is not logged in."}

  This user has ${userActiveGrants} active grants. There is a limit of active grants per user: ${MAX_GRANTS_PER_USER}.
  It means that the user ${userActiveGrants >= MAX_GRANTS_PER_USER ? "has reached the limit and cannot apply for another grant." : "has not reached the limit and can apply for grant. Do not mention the limit nor the number of grants to the user at all, until they ask about it."}
  
  ${farcasterAccountPrompt}

  ${await getLocationPrompt()}

  ${await getUserAgentPrompt()}

  ${fid ? await getBuilderProfilePrompt(fid) : ""}
  `
})

async function getLocationPrompt(): Promise<string> {
  const headersList = await headers()

  const country = headersList.get("X-Vercel-IP-Country")
  const countryRegion = headersList.get("X-Vercel-IP-Country-Region")
  const city = headersList.get("X-Vercel-IP-City")

  if (!city && !country && !countryRegion) return ""

  return `### Language and location\n\nHere is the user's location: ${city}, ${country}, ${countryRegion} from geolocation. If the user is not in the US or English speaking country, feel free to ask questions in their language. At the start, you may want to ask user which language they prefer in conversation with you. In the same message do not ask more questions - let the user first pick the language. Do not mention you know the city - it may be not accurate.`
}

async function getUserAgentPrompt(): Promise<string> {
  const headersList = await headers()

  const userAgent = headersList.get("user-agent")
  if (!userAgent) return ""

  return `### User agent\n\nHere is the user agent: ${userAgent}. If the user is on mobile, you should be incredibly concise and to the point. They do not have a lot of time or space to read, so you must be incredibly concise and keep your questions and responses to them short in as few words as possible, unless they ask for clarification or it's otherwise necessary.`
}

async function getFarcasterAccountPrompt(
  address?: string,
): Promise<{ farcasterAccountPrompt: string; fid: number }> {
  if (!address) return { farcasterAccountPrompt: "", fid: 0 }
  const farcasterUsers = (await getFarcasterUsersByEthAddress(getEthAddress(address))).map((u) => ({
    username: u.fname,
    displayName: u.display_name,
    bio: u.bio,
    avatarUrl: u.avatar_url,
    fid: Number(u.fid), // Convert BigInt to Number for JSON serialization
  }))

  if (farcasterUsers.length === 0)
    return {
      farcasterAccountPrompt:
        "The user has no Farcaster accounts connected to the address. Please prompt them to verify their address by asking them to visit the link: https://warpcast.com/~/settings/verified-addresses",
      fid: 0,
    }

  const channelIds = []
  for (const user of farcasterUsers) {
    const channels = await getFarcasterUserChannels(user.fid)
    channelIds.push(...channels.map((c) => c.channelId))
  }

  const prompt = `Here is the list of Farcaster users that are connected to the ${address}: ${JSON.stringify(farcasterUsers)}. You may learn something about the user from this information.
  
    The user is a member of the following Farcaster channels: ${JSON.stringify(Array.from(new Set(channelIds)))}.
  
    If the user has exactly one Farcaster account connected to the address, you can use it for the application. Inform briefly the user that their Farcaster account will be used for the application. If user has more Farcaster accounts, you can ask them to pick one.
    
    In context of Farcaster account please refer to the 'username' field (@username), not 'displayName'.`

  return { farcasterAccountPrompt: prompt, fid: farcasterUsers[0].fid }
}

async function getBuilderProfilePrompt(fid: number): Promise<string> {
  const query = `
    SELECT 
      raw_content 
    FROM embeddings
    WHERE 
      users && ARRAY['${fid.toString()}'] AND 
      type = 'builder-profile'
    ORDER BY created_at DESC
    LIMIT 1
  `
  const builderProfiles = await embeddingsDb(query)

  const builderProfile = builderProfiles[0]

  if (!builderProfile) {
    console.warn(`No builder profile found for fid ${fid}`)
    return ""
  }

  return `Here is a builder profile for the user, compiled from all of their public posts on Farcaster.
  ${JSON.stringify(builderProfile.raw_content)}
  `
}
