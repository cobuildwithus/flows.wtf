import { SocialProfile } from "./social-profile"

const NEYNAR_API_KEY = `${process.env.NEYNAR_API_KEY}`

if (!NEYNAR_API_KEY) {
  throw new Error("NEYNAR_API_KEY environment variable is not set")
}

async function fetchNeynar<T>(url: string, ttl = 21600): Promise<T> {
  const response = await fetch(url, {
    headers: { "x-api-key": NEYNAR_API_KEY, Accept: "application/json" } as Record<string, string>,
    next: { revalidate: ttl },
  })

  if (!response.ok) {
    const error = await response.json()
    console.error(error)
    throw new Error(error?.message || "Neynar API error")
  }

  return response.json() as Promise<T>
}

export async function getFarcasterProfile(
  username: string,
  ttl = 21600,
): Promise<SocialProfile | null> {
  try {
    const data = await fetchNeynar<{
      user: {
        display_name: string
        pfp_url: string
        profile?: { bio?: { text?: string } }
        follower_count: number
        username: string
      }
    }>(
      `https://api.neynar.com/v2/farcaster/user/by_username?username=${encodeURIComponent(username)}`,
      ttl,
    )
    const user = data.user
    return {
      name: user.display_name,
      imageUrl: user.pfp_url,
      bio: user.profile?.bio?.text || "",
      followersCount: user.follower_count,
      url: `https://farcaster.xyz/${user.username}`,
      platform: "farcaster",
    }
  } catch (error) {
    console.error(error)
    return null
  }
}

export async function getFarcasterChannel(
  query: string,
  ttl = 21600,
): Promise<SocialProfile | null> {
  try {
    const data = await fetchNeynar<{
      channels?: {
        name: string
        image_url: string
        description?: string
        follower_count: number
        url: string
      }[]
    }>(`https://api.neynar.com/v2/farcaster/channel/search?q=${encodeURIComponent(query)}`, ttl)
    const channel = data.channels?.[0]
    if (!channel) return null
    return {
      name: channel.name,
      imageUrl: channel.image_url,
      bio: channel.description || "",
      followersCount: channel.follower_count,
      url: channel.url,
      platform: "farcasterChannel",
    }
  } catch (error) {
    console.error(error)
    return null
  }
}
