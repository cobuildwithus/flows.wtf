import "server-only"

import { canRequestBeExecuted } from "@/app/components/dispute/helpers"
import { DateTime } from "@/components/ui/date-time"
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible"
import { UserProfile } from "@/components/user-profile/user-profile"
import database from "@/lib/database/edge"
import { Status } from "@/lib/enums"
import { getEthAddress } from "@/lib/utils"
import type { Grant } from "@prisma/flows"
import dynamic from "next/dynamic"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

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

export async function StatusNotDisputed(props: Props) {
  const { grant, flow } = props

  const evidence = await database.evidence.findFirst({
    where: { evidenceGroupID: grant.evidenceGroupID },
  })

  function EvidenceDetails() {
    if (!evidence) return null

    function EvidenceTriggerContent({ party }: { party: string }) {
      return (
        <UserProfile withPopover={false} hideLink address={getEthAddress(party)}>
          {(profile) => (
            <div className="flex min-w-0 items-center gap-1.5">
              <Avatar className="size-4">
                <AvatarImage src={profile.pfp_url} alt={profile.display_name} />
                <AvatarFallback>{profile.display_name?.[0]?.toUpperCase() ?? "?"}</AvatarFallback>
              </Avatar>
              <span className="truncate font-medium">{profile.display_name}</span>
              <span className="ml-1 text-sm text-muted-foreground">requested removal.</span>
            </div>
          )}
        </UserProfile>
      )
    }

    return (
      <ul className="flex flex-col gap-2">
        <Collapsible>
          <CollapsibleTrigger asChild>
            <li className="flex w-full cursor-pointer items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-muted">
              {evidence.party && <EvidenceTriggerContent party={evidence.party} />}
            </li>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="max-w-md break-words p-2 text-sm text-muted-foreground">
              {(() => {
                const parts = evidence.evidence?.split(" || ")
                const comment =
                  parts && parts.length > 1 ? parts.slice(1).join(" ") : evidence.evidence
                return <div className="max-w-full overflow-x-auto break-words">{comment}</div>
              })()}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </ul>
    )
  }

  // REMOVED
  if (grant.isRemoved) {
    return (
      <div className="space-y-4 text-sm">
        The {grant.isFlow ? "flow" : "grant"} has been{" "}
        <span className="font-medium text-orange-500">removed</span>.
        <EvidenceDetails />
      </div>
    )
  }

  // READY TO EXECUTE
  if (canRequestBeExecuted(grant)) {
    return (
      <div className="space-y-4 text-sm">
        <li>No one decided to challenge the removal request.</li>
        <EvidenceDetails />
        <li>
          Execute the request to finalize the process and remove the{" "}
          {grant.isFlow ? "flow" : "grant"}.
        </li>
        <RequestExecuteButton grant={grant} flow={flow} className="!mt-6 w-full" />
      </div>
    )
  }

  // REMOVAL REQUESTED, CHALLENGE PERIOD
  if (grant.status === Status.ClearingRequested) {
    return (
      <div className="space-y-4 text-sm">
        This {grant.isFlow ? "flow" : "grant"} will be{" "}
        <span className="font-medium text-red-500">removed</span> unless someone challenges the
        removal request by{" "}
        <DateTime
          shortDate
          date={new Date(grant.challengePeriodEndsAt * 1000)}
          className="font-medium"
        />
        .
        <EvidenceDetails />
        <DisputeStartButton
          initialMessage="I want to challenge this removal request"
          grant={grant}
          variant="outline"
          flow={flow}
          className="!mt-6 w-full"
        />
      </div>
    )
  }

  // DEFAULT: NO REMOVAL REQUEST YET
  return (
    <div className="space-y-4 text-sm">
      <div className="leading-relaxed text-muted-foreground">
        Curators of the &quot;{flow.title}&quot; flow can request the removal of this{" "}
        {grant.isFlow ? "flow" : "grant"} if they think there is a valid reason to do so.
      </div>
      {grant.status === Status.Registered && (
        <GrantRemoveRequestButton removalType={grant.isFlow ? "flow" : "grant"} />
      )}
    </div>
  )
}
