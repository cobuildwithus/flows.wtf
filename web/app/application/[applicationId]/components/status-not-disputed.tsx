import { DisputeStartButton } from "@/app/components/dispute/dispute-start"
import { canRequestBeExecuted } from "@/app/components/dispute/helpers"
import { RequestExecuteButton } from "@/app/components/dispute/request-execute"
import { DateTime } from "@/components/ui/date-time"
import { Grant } from "@prisma/flows"
import { Status } from "@/lib/enums"

interface Props {
  grant: Grant
  flow: Grant
}

export const StatusNotDisputed = (props: Props) => {
  const { grant, flow } = props

  if (canRequestBeExecuted(grant)) {
    return (
      <div className="space-y-4 text-sm">
        <li>
          The request has been <span className="font-medium text-green-500">approved</span>
        </li>
        <li>No one decided to challenge it.</li>
        <li>Execute the request to finalize the process.</li>
        <RequestExecuteButton grant={grant} flow={flow} className="!mt-6 w-full" />
      </div>
    )
  }

  const isClearingRequest = grant.status === Status.ClearingRequested

  return (
    <div className="space-y-4 text-sm">
      You can challenge this {isClearingRequest ? "removal request" : "application"} by paying a
      fee. The winner gets the other party&apos;s deposit. If no one challenges by{" "}
      <DateTime date={new Date(grant.challengePeriodEndsAt * 1000)} className="font-medium" />, the{" "}
      {isClearingRequest ? "removal request" : "application"} is automatically approved.
      <DisputeStartButton grant={grant} flow={flow} className="!mt-6 w-full" />
    </div>
  )
}
