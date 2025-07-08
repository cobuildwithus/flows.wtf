import type { Grant } from "@prisma/flows"
import { Status } from "./enums"
import { LimitedGrant } from "./database/types"

const DAYS_TO_BE_NEW = 10

export function isGrantNew(grant: Pick<Grant, "activatedAt">) {
  if (!grant.activatedAt) return false

  const activatedAt = new Date(grant.activatedAt * 1000)

  const diffTime = Math.abs(new Date().getTime() - activatedAt.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return diffDays <= DAYS_TO_BE_NEW
}

export function sortGrants(a: Omit<Grant, "description">, b: Omit<Grant, "description">) {
  const aIsClearingRequested = a.status === Status.ClearingRequested
  const bIsClearingRequested = b.status === Status.ClearingRequested

  if (aIsClearingRequested && !bIsClearingRequested) {
    return -1
  }
  if (!aIsClearingRequested && bIsClearingRequested) {
    return 1
  }
  return Number(b.monthlyIncomingFlowRate) - Number(a.monthlyIncomingFlowRate)
}

export function getGrantUrl(grant: {
  isOnchainStartup: boolean
  isFlow: boolean
  isSiblingFlow: boolean
  id: string
  recipient: string
}) {
  if (grant.isOnchainStartup) {
    return `/startup/${grant.id}`
  }
  if (grant.isFlow || grant.isSiblingFlow) {
    if (grant.isSiblingFlow) {
      return `/flow/${grant.recipient}`
    }
    return `/flow/${grant.id}`
  }
  return `/item/${grant.id}`
}
