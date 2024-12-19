import { DerivedData, Grant, Story } from "@prisma/flows"
import { Status } from "../enums"

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

const rocketman = "0x289715ffbb2f4b482e2917d2f183feab564ec84f"
const woj = "0x6cc34d9fb4ae289256fc1896308d387aee2bcc52"

export function canEditStory(story: Story, user: string | undefined) {
  return (
    user &&
    (story.participants.includes(user) ||
      story.author === user ||
      user === rocketman ||
      user === woj)
  )
}

export function canEditGrant(grant: Pick<Grant, "recipient">, user: string | undefined) {
  return user && [grant.recipient, rocketman, woj].includes(user)
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
