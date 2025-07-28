import type { Opportunity } from "@prisma/flows"
import type { TeamMember } from "@/lib/onchain-startup/team-members"

export interface OpportunityWithCount extends Opportunity {
  startup: {
    id: string
    title: string
    image: string
  }
}

export interface FlowWithDisplayAmount {
  id: string
  title: string
  image: string
  tagline: string | null
  displayAmount: number
  underlyingTokenDecimals: number
  underlyingTokenPrefix: string
  underlyingTokenSymbol: string
}

export interface StartupWithRevenue {
  id: string
  title: string
  shortMission: string
  image: string
  revenue: number
  salesChange: number
  backers: number
  projectIdBase: number
  chainId: number
  team: TeamMember[]
  isBackedByFlows: boolean
}
