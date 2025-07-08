export interface FlowSearchResult {
  id: string
  title: string
  description: string
  image: string
  tagline: string | null
  recipient: string
  chainId: number
  isActive: boolean
  monthlyIncomingFlowRate: string
  monthlyOutgoingFlowRate: string
  superToken: string
  activeRecipientCount: number
}
