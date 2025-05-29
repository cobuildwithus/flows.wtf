import { StoreConfig } from "@/lib/shopify/stores"
import { SocialProfileUsernames } from "@/lib/social-metrics/social-profile"

export interface StartupData {
  accelerator: string
  title: string
  tagline: string
  image: string
  mission: string
  deliverables: string[]
  shopify: StoreConfig
  supports: `0x${string}`[]
  socialUsernames: SocialProfileUsernames
  reviews: { url: string; image: string }[]
  diagram: {
    action: { name: string; description?: string }
    receive: { name: string; description?: string }
  }
  splits: {
    team: number
    support: number
    treasury: number
    costs: Array<{
      name: string
      amount: number
      description: string
    }>
  }
}
