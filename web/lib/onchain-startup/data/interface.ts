import { StoreConfig } from "@/lib/shopify/stores"
import { SocialProfileUsernames } from "@/lib/social-metrics/social-profile"
import { AcceleratorId } from "./accelerators"

export interface StartupData {
  slug: string
  acceleratorId: AcceleratorId
  title: string
  image: string
  shortMission: string
  longMission: string
  shopify?: StoreConfig
  impactFlowId?: `0x${string}`
  socialUsernames: SocialProfileUsernames
  reviews: { url: string; image: string }[]
  diagram: {
    action: { name: string; description?: string }
    receive: { name: string; description?: string }
  }
}
