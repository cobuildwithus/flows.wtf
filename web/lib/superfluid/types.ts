import type { SuperfluidFlow } from "@prisma/flows"

export interface SuperfluidFlowWithState extends SuperfluidFlow {
  isOutgoing: boolean
  isIncoming: boolean
  isActive: boolean
}
