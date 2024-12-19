import "server-only"

import { DisputeUserVote } from "@/app/components/dispute/dispute-user-vote"
import { Badge } from "@/components/ui/badge"
import database, { getCacheStrategy } from "@/lib/database/edge"
import { Status } from "@/lib/enums"
import { cn } from "@/lib/utils"
import { Grant } from "@prisma/flows"
import { StatusDisputed } from "./status-disputed"
import { StatusNotDisputed } from "./status-not-disputed"

interface Props {
  grant: Grant
  flow: Grant
  className?: string
}

export const CurationCard = async (props: Props) => {
  const { grant, flow, className } = props

  const isDisputed = grant.isDisputed

  const dispute = await database.dispute.findFirst({
    where: { grantId: grant.id },
    orderBy: { creationBlock: "desc" },
    include: { evidences: true },
    ...getCacheStrategy(60),
  })

  return (
    <div className={cn("flex flex-col space-y-4", className)}>
      <div className="flex h-full flex-col rounded-xl border bg-white/50 p-5 dark:bg-transparent">
        <h3 className="mb-4 flex items-center justify-between font-medium">
          Curation
          {grant.status === Status.ClearingRequested && (
            <Badge variant="destructive">Removal Requested</Badge>
          )}
        </h3>
        {!isDisputed && <StatusNotDisputed grant={grant} flow={flow} />}
        {isDisputed && dispute && <StatusDisputed grant={grant} flow={flow} dispute={dispute} />}
      </div>

      {dispute && isDisputed && (
        <div className="rounded-xl border bg-white/50 p-6 dark:bg-transparent">
          <h3 className="mb-4 font-medium">Your vote</h3>
          <DisputeUserVote grant={grant} flow={flow} dispute={dispute} />
        </div>
      )}
    </div>
  )
}
