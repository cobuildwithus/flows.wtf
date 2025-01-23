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
    <div className={cn("flex h-full flex-col space-y-4", className)}>
      <div className="flex flex-1 flex-col rounded-xl border bg-white/50 p-6 shadow-sm transition-colors hover:bg-white/60 dark:bg-transparent dark:hover:bg-white/5">
        <h3 className="mb-6 flex items-center justify-between font-medium">
          Curation Status
          {grant.status === Status.ClearingRequested && (
            <Badge variant="destructive" className="font-medium">
              Removal Requested
            </Badge>
          )}
        </h3>
        <div className="flex-1">
          {!isDisputed && <StatusNotDisputed grant={grant} flow={flow} />}
          {isDisputed && dispute && <StatusDisputed grant={grant} flow={flow} dispute={dispute} />}
        </div>
      </div>

      {dispute && isDisputed && (
        <div className="rounded-xl border bg-white/50 p-6 shadow-sm transition-colors hover:bg-white/60 dark:bg-transparent dark:hover:bg-white/5">
          <h3 className="mb-6 text-lg font-medium">Your Vote</h3>
          <DisputeUserVote grant={grant} flow={flow} dispute={dispute} />
        </div>
      )}
    </div>
  )
}
