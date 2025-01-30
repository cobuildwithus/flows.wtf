import type { Grant } from "@prisma/flows"

const DAYS_TO_BE_NEW = 10
export function isGrantNew(grant: Pick<Grant, "createdAt">) {
  const createdAt = new Date(grant.createdAt * 1000)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - createdAt.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays <= DAYS_TO_BE_NEW
}
