import { getSocialMetrics } from "./client"
import { SocialProfile } from "./social-profile"

export async function getInstagramProfile(username: string): Promise<SocialProfile | null> {
  try {
    const response = await getSocialMetrics<{
      data: {
        user: {
          biography: string
          profile_pic_url_hd: string
          edge_followed_by: { count: number }
          full_name: string
          username: string
        }
      }
    }>(`/instagram/profile/?handle=${username}`)
    const user = response.data.user
    return {
      name: user.full_name,
      imageUrl: user.profile_pic_url_hd,
      bio: user.biography,
      followersCount: user.edge_followed_by.count,
      url: `https://instagram.com/${user.username}`,
      platform: "instagram",
    }
  } catch (error) {
    console.error(error)
    return null
  }
}
