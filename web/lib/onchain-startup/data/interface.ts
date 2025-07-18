import { StoreConfig } from "@/lib/shopify/stores"
import { SocialProfileUsernames } from "@/lib/social-metrics/social-profile"

export interface StartupData {
  slug: string
  title: string
  image: string
  shortMission: string
  longMission: string
  shopify?: StoreConfig
  impactFlowId?: `0x${string}`
  socialUsernames: SocialProfileUsernames
  reviews: { url: string; image: string }[]
  diagram: {
    receive?: { name: string; description?: string }
  }
}
