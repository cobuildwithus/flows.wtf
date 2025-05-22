import { getSocialMetrics } from "./client"
import { SocialProfile } from "./social-profile"

export async function getTikTokProfile(username: string): Promise<SocialProfile | null> {
  try {
    const response = await getSocialMetrics<{
      user: {
        nickname: string
        avatarLarger: string
        signature: string
        uniqueId: string
      }
      stats: {
        followerCount: number
      }
    }>(`/tiktok/profile/?handle=${username}`)
    return {
      name: response.user.nickname,
      imageUrl: response.user.avatarLarger,
      bio: response.user.signature,
      followersCount: response.stats.followerCount,
      url: `https://www.tiktok.com/@${response.user.uniqueId}`,
      platform: "tiktok",
    }
  } catch (error) {
    console.error(error)
    return null
  }
}
