import type { Grant } from "@prisma/flows"

const DAYS_TO_BE_NEW = 10
export function isGrantNew(grant: Pick<Grant, "activatedAt">) {
  if (!grant.activatedAt) return false

  const activatedAt = new Date(grant.activatedAt * 1000)

  const diffTime = Math.abs(new Date().getTime() - activatedAt.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return diffDays <= DAYS_TO_BE_NEW
}
