import { getSocialMetrics } from "./client"
import { SocialProfile } from "./social-profile"

export async function getXProfile(username: string): Promise<SocialProfile | null> {
  try {
    const response = await getSocialMetrics<{
      legacy: {
        name: string
        description: string
        followers_count: number
        profile_image_url_https: string
      }
    }>(`/twitter/profile/?handle=${username}`)
    return {
      name: response.legacy.name,
      imageUrl: response.legacy.profile_image_url_https,
      bio: response.legacy.description,
      followersCount: response.legacy.followers_count,
      url: `https://x.com/${username}`,
      platform: "x",
    }
  } catch (error) {
    console.error(error)
    return null
  }
}
