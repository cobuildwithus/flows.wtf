import "server-only"

import { UserProfile } from "@/components/user-profile/user-profile"
import database from "@/lib/database/flows-db"
import { getEthAddress } from "@/lib/utils"
import type { Dispute, Evidence, Grant } from "@prisma/flows"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible"

interface Props {
  grant: Grant
  dispute: Dispute & { evidences: Evidence[] }
}

export async function DisputedEvidence({ grant, dispute }: Props) {
  const evidences = await database.evidence.findMany({
    where: { evidenceGroupID: grant.evidenceGroupID },
    orderBy: { blockNumber: "asc" },
  })

  if (!evidences || evidences.length === 0) return null

  function getPartyRole(evidenceParty: string) {
    if (evidenceParty === dispute.evidences?.[0]?.party) return "requester"
    if (evidenceParty === dispute.challenger) return "challenger"
    return "other"
  }

  function EvidenceTriggerContent({ party }: { party: string }) {
    const role = getPartyRole(party)
    return (
      <UserProfile withPopover={false} hideLink address={getEthAddress(party)}>
        {(profile) => (
          <div className="flex min-w-0 items-center gap-1.5">
            <Avatar className="size-4 lg:size-5">
              <AvatarImage src={profile.pfp_url} alt={profile.display_name} />
            </Avatar>
            <span className="truncate font-medium">{profile.display_name}</span>
            <span className="ml-1 text-sm text-muted-foreground">
              {role === "requester"
                ? "requested removal."
                : role === "challenger"
                  ? "challenged the request."
                  : ""}
            </span>
          </div>
        )}
      </UserProfile>
    )
  }

  return (
    <ul className="flex flex-col gap-2">
      {evidences.map((e) => (
        <Collapsible key={e.id}>
          <CollapsibleTrigger asChild>
            <li className="flex w-full cursor-pointer items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-muted">
              <EvidenceTriggerContent party={e.party} />
            </li>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="max-w-md break-words p-2 text-sm text-muted-foreground">
              {(() => {
                const parts = e.evidence.split(" || ")
                const comment = parts.length > 1 ? parts.slice(1).join(" ") : e.evidence
                return <div className="max-w-full overflow-x-auto break-words">{comment}</div>
              })()}
            </div>
          </CollapsibleContent>
        </Collapsible>
      ))}
    </ul>
  )
}
