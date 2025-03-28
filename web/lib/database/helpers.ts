import type { DerivedData, Grant, Story } from "@prisma/flows"
import { Status } from "../enums"
import { MAX_GRANTS_PER_USER } from "../config"

export function isGrantApproved(grant: Pick<Grant, "status">) {
  const { status } = grant
  return status === Status.Registered || status === Status.ClearingRequested
}

export function isGrantChallenged(grant: Pick<Grant, "status" | "isDisputed" | "isResolved">) {
  const { status, isDisputed, isResolved } = grant

  if (status === Status.ClearingRequested) return true
  return status === Status.RegistrationRequested && isDisputed && !isResolved
}

export function isGrantAwaiting(grant: Pick<Grant, "status">) {
  return grant.status === Status.RegistrationRequested
}

const rocketman = "0x289715ffbb2f4b482e2917d2f183feab564ec84f" as const
const riderway = "0x2830e21792019ce670fbc548aacb004b08c7f71f" as const

export function canEditStory(
  story: Pick<Story, "participants" | "author">,
  user: string | undefined,
): boolean {
  if (!user) return false
  return (
    story.participants.includes(user) ||
    story.author === user ||
    user === rocketman ||
    user === riderway
  )
}

export function isAdmin(user: string | undefined): boolean {
  return user === rocketman || user === riderway
}

export function canEditGrant(grant: Pick<Grant, "recipient">, user: string | undefined): boolean {
  if (!user) return false
  return [grant.recipient, rocketman, riderway].includes(user)
}

export function meetsMinimumSalary(
  flow: Pick<
    Grant,
    | "monthlyBaselinePoolFlowRate"
    | "activeRecipientCount"
    | "awaitingRecipientCount"
    | "challengedRecipientCount"
  > & { derivedData: DerivedData | null },
) {
  const {
    monthlyBaselinePoolFlowRate,
    activeRecipientCount,
    awaitingRecipientCount,
    challengedRecipientCount,
  } = flow

  const currentMinimumSalary =
    Number(monthlyBaselinePoolFlowRate) /
    (activeRecipientCount + awaitingRecipientCount - challengedRecipientCount + 1)

  return currentMinimumSalary >= Number(flow.derivedData?.minimumSalary || 0)
}

export function userBelowMaxGrants(numGrants: number) {
  return numGrants < MAX_GRANTS_PER_USER
}
