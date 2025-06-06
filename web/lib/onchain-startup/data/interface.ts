import { StoreConfig } from "@/lib/shopify/stores"
import { SocialProfileUsernames } from "@/lib/social-metrics/social-profile"
import { AcceleratorId } from "./accelerators"

export interface StartupData {
  acceleratorId: AcceleratorId
  revnetProjectId: number
  title: string
  tagline: string
  image: string
  mission: string
  longMission: string
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
  }
}
