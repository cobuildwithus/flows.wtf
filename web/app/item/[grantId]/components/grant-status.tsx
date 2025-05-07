import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Status } from "@/lib/enums"
import { cn } from "@/lib/utils"
import { Grant } from "@prisma/flows"
import { Suspense, useMemo } from "react"
import { CurationStatus, CurationVote } from "./curation-card"
import { FlowRemovedCard } from "./flow-removed-card"

interface Props {
  grant: Grant
  flow: Grant
}

export function GrantStatus(props: Props) {
  const { grant, flow } = props

  const isWarning = useMemo(() => {
    if (grant.status === Status.ClearingRequested) return true
    if (grant.status === Status.Absent) return true
    if (flow.isRemoved) return true
    return false
  }, [grant.status, flow.isRemoved])

  const text = useMemo(() => {
    if (grant.status === Status.ClearingRequested) return "Challenged"
    if (grant.status === Status.Absent) return "Removed"
    if (flow.isRemoved) return "Removed"
    return "Active"
  }, [grant.status, flow.isRemoved])

  return (
    <Dialog>
      <DialogTrigger className="group absolute left-4 top-4 z-30 text-left">
        <span className="lg:text-2xl">
          <Badge variant={isWarning ? "warning" : "success"} className="text-sm">
            {text}
          </Badge>
        </span>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Grant Curation</DialogTitle>
        <Suspense>
          {flow.isActive ? (
            <div className={cn({ "divide-y divide-border [&>*]:py-2": grant.isDisputed })}>
              <CurationStatus grant={grant} flow={flow} />
              {grant.isDisputed && <CurationVote grant={grant} />}
            </div>
          ) : (
            <FlowRemovedCard flow={flow} />
          )}
        </Suspense>
      </DialogContent>
    </Dialog>
  )
}
