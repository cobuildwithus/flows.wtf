import type { Profile } from "@prisma/farcaster"

const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY

if (!NEYNAR_API_KEY) {
  throw new Error("NEYNAR_API_KEY environment variable is not set")
}

interface NeynarUserResponse {
  users: Array<{
    object: string
    fid: number
    username: string
    display_name: string
    custody_address: string
    pfp_url: string
    profile: {
      bio: {
        text: string
        mentioned_profiles: string[]
      }
      location: {
        latitude: number
        longitude: number
        address: {
          city: string
          state: string
          state_code: string
          country: string
          country_code: string
        }
      }
    }
    follower_count: number
    following_count: number
    verifications: string[]
    verified_addresses: {
      eth_addresses: string[]
      sol_addresses: string[]
    }
    verified_accounts: Array<{
      platform: string
      username: string
    }>
    power_badge: boolean
    experimental: {
      neynar_user_score: number
    }
    viewer_context?: {
      following: boolean
      followed_by: boolean
      blocking: boolean
      blocked_by: boolean
    }
  }>
}

export const fetchFarcasterUserFromApi = async (fid: number): Promise<Profile> => {
  try {
    const headers = new Headers({
      "x-api-key": NEYNAR_API_KEY,
      accept: "application/json",
      "x-neynar-experimental": "false",
    })

    let lastError: Error | null = null
    const maxRetries = 3
    for (let i = 0; i < maxRetries; i++) {
      try {
        const response = await fetch(`https://api.neynar.com/v2/farcaster/user/bulk?fids=${fid}`, {
          method: "GET",
          headers,
        })

        if (!response.ok) {
          const text = await response.text()
          console.error({ text })
          throw new Error(text || "Failed to fetch user from Neynar API")
        }

        const data = (await response.json()) as NeynarUserResponse
        const user = data.users[0]

        if (!user) {
          throw new Error("User not found")
        }

        return {
          fid: BigInt(user.fid),
          fname: user.username,
          display_name: user.display_name,
          avatar_url: user.pfp_url,
          bio: user.profile.bio?.text ?? null,
          verified_addresses: user.verified_addresses.eth_addresses,
          manual_verified_addresses: [],
          updated_at: new Date(),
        }
      } catch (error) {
        lastError = error as Error
        if (i < maxRetries - 1) {
          await new Promise((resolve) => setTimeout(resolve, 2000))
        }
      }
    }

    throw lastError
  } catch (error) {
    console.error("Error fetching user from Neynar API:", error)
    throw error
  }
}
