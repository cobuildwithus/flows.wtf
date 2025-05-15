import { Dialog, DialogTrigger, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { InfoIcon } from "lucide-react"
import { Stat } from "@/app/item/[grantId]/cards/stats"
import { RemovedGrant } from "../../../lib/database/queries/get-removed-grants"

export function RugRateExplainerDialog({
  removedGrants,
  totalPaidOut,
}: {
  removedGrants: Pick<RemovedGrant, "totalEarned" | "derivedData">[]
  totalPaidOut: number
}) {
  const adjustedTotal = removedGrants.reduce((acc, grant) => {
    const completionRate = grant.derivedData?.deliverablesCompletionRate?.completionRate ?? 0
    if (completionRate < 50) {
      return acc + Number(grant.totalEarned) * ((100 - completionRate) / 100)
    }
    return acc
  }, 0)

  const rugRate = adjustedTotal / totalPaidOut

  return (
    <Dialog>
      <DialogTrigger className="group relative col-span-full text-left duration-200 hover:scale-[1.02] xl:col-span-3">
        <div className="col-span-full xl:col-span-3">
          <Stat label="Rug rate">
            {(rugRate * 100).toFixed(0)}%
            <InfoIcon className="absolute right-4 top-4 size-6 opacity-0 transition-opacity duration-200 group-hover:opacity-75" />
          </Stat>
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Rug Rate Explained</DialogTitle>
        <div className="mt-4 space-y-2 text-sm text-muted-foreground">
          <p>
            The <Badge variant="warning">Rug Rate</Badge> measures the percentage of funds paid out
            to projects that significantly under-delivered (deliverables completion rate below 50%).
          </p>
          <p>
            It's calculated by summing the adjusted amounts from under-performing projects and
            dividing by the total amount paid out.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
