import type { Grant } from "@prisma/flows"
import { Status } from "./enums"

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
