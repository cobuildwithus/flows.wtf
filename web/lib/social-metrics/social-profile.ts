import { getFarcasterChannel, getFarcasterProfile } from "./farcaster"
import { getInstagramProfile } from "./instagram"
import { getTikTokProfile } from "./tiktok"
import { getXProfile } from "./x"

export type SocialPlatform = "x" | "instagram" | "tiktok" | "farcaster" | "farcasterChannel"

export interface SocialProfile {
  name: string
  imageUrl: string
  bio: string
  followersCount: number
  url: string
  platform: SocialPlatform
}

export type SocialProfileUsernames = Partial<Record<SocialPlatform, string>>

export async function getSocialProfile(
  username: string,
  type: SocialPlatform,
): Promise<SocialProfile | null> {
  switch (type) {
    case "x":
      return getXProfile(username)
    case "instagram":
      return getInstagramProfile(username)
    case "tiktok":
      return getTikTokProfile(username)
    case "farcaster":
      return getFarcasterProfile(username)
    case "farcasterChannel":
      return getFarcasterChannel(username)
  }
}

export async function getSocialProfiles(usernames: SocialProfileUsernames) {
  const profiles = await Promise.all(
    Object.entries(usernames).map(([platform, username]) =>
      getSocialProfile(username, platform as SocialPlatform),
    ),
  )

  return profiles.filter(Boolean) as SocialProfile[]
}
