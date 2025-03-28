import "server-only"

import { Challenger } from "@/app/application/[applicationId]/components/challenger"
import { canRequestBeExecuted, formatEvidence } from "@/app/components/dispute/helpers"
import { DateTime } from "@/components/ui/date-time"
import database from "@/lib/database/edge"
import { Status } from "@/lib/enums"
import { getEthAddress } from "@/lib/utils"
import type { Grant } from "@prisma/flows"
import dynamic from "next/dynamic"

const GrantRemoveRequestButton = dynamic(() =>
  import("./remove-request-button").then((mod) => mod.GrantRemoveRequestButton),
)

const RequestExecuteButton = dynamic(() =>
  import("@/app/components/dispute/request-execute").then((mod) => mod.RequestExecuteButton),
)

const DisputeStartButton = dynamic(() =>
  import("@/app/components/dispute/dispute-start").then((mod) => mod.DisputeStartButton),
)

interface Props {
  grant: Grant
  flow: Grant
}

export const StatusNotDisputed = async (props: Props) => {
  const { grant, flow } = props

  const evidence = await database.evidence.findFirst({
    where: { evidenceGroupID: grant.evidenceGroupID },
  })

  if (grant.isRemoved) {
    return (
      <div className="flex grow flex-col justify-between space-y-4 text-sm">
        <li>
          The {grant.isFlow ? "flow" : "grant"} has been{" "}
          <span className="font-medium text-orange-500">removed</span>.
        </li>
        {evidence && (
          <>
            {evidence.party && <Challenger address={getEthAddress(evidence.party)} />}
            {evidence.evidence && <>{formatEvidence(evidence.evidence)}</>}
          </>
        )}
      </div>
    )
  }

  if (canRequestBeExecuted(grant)) {
    return (
      <div className="justify-between space-y-4 text-sm">
        <li>
          The {grant.isFlow ? "flow" : "grant"} has been marked for{" "}
          <span className="font-medium text-red-500">removal</span>.
        </li>
        <li>No one decided to challenge the removal request.</li>
        {evidence?.evidence && <li>{formatEvidence(evidence.evidence)}</li>}
        <li>
          Execute the request to finalize the process and remove the{" "}
          {grant.isFlow ? "flow" : "grant"}.
        </li>
        <RequestExecuteButton grant={grant} flow={flow} className="!mt-6 w-full" />
      </div>
    )
  }

  if (grant.status === Status.ClearingRequested) {
    return (
      <div className="flex h-full flex-col justify-between">
        <div className="space-y-4 text-sm">
          <li>
            This {grant.isFlow ? "flow" : "grant"} will be{" "}
            <span className="font-medium text-red-500">removed</span> - unless someone challenges
            the removal request to send it to a vote.
          </li>
          {evidence?.party && <Challenger address={getEthAddress(evidence.party)} />}
          {evidence?.evidence && (
            <div className="text-muted-foreground md:pl-5">{formatEvidence(evidence.evidence)}</div>
          )}
          <li>
            If no challenges are submitted{" "}
            <DateTime
              date={new Date(grant.challengePeriodEndsAt * 1000)}
              className="font-medium"
              relative
            />
            {", "}
            the grant will be removed.
          </li>
        </div>

        <DisputeStartButton grant={grant} flow={flow} className="!mt-6 w-full" />
      </div>
    )
  }

  return (
    <div className="flex grow flex-col justify-between space-y-4 text-sm">
      <div className="leading-relaxed text-muted-foreground">
        Curators of the &quot;{flow.title}&quot; flow can request the removal of this{" "}
        {grant.isFlow ? "flow" : "grant"} if they think there is a valid reason to do so.
      </div>

      {grant.status === Status.Registered && <GrantRemoveRequestButton grant={grant} flow={flow} />}
    </div>
  )
}
