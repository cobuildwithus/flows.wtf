import { Gradient } from "@/app/item/[grantId]/cards/gradient-card"
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
  gradients: {
    mission: Gradient
    deliverables: Gradient
  }
}
