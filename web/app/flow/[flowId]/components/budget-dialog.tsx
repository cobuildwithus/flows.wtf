import { Badge } from "@/components/ui/badge"
import { Currency } from "@/components/ui/currency"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { FlowWithGrants } from "@/lib/database/queries/flow"
import { explorerUrl } from "@/lib/utils"
import Link from "next/link"
import { base } from "viem/chains"
import { ManageFlow } from "./management/management-dashboard"

interface Props {
  flow: FlowWithGrants
}

export const BudgetDialog = (props: Props) => {
  const { flow } = props

  const TOTAL_PERCENT = 1e6 // 100% in basis points
  const managerPercent = flow.managerRewardPoolFlowRatePercent ?? 0
  const remainingPercent = TOTAL_PERCENT - managerPercent

  const baselinePercent = ((flow.baselinePoolFlowRatePercent ?? 0) * remainingPercent) / 1e6
  const bonusPercent = remainingPercent - baselinePercent

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Badge className="cursor-help">
          <Currency>
            {(flow.subgrants.length > 0
              ? flow.monthlyOutgoingFlowRate
              : flow.monthlyIncomingFlowRate
            ).toString()}
          </Currency>{" "}
          /mo
        </Badge>
      </DialogTrigger>
      <DialogContent>
        <div className="flex flex-col space-y-3">
          <p className="text-sm font-medium">Min. Salary</p>

          {flow.derivedData?.minimumSalary && (
            <p className="text-sm">
              <Currency>{flow.derivedData.minimumSalary}</Currency>/month
            </p>
          )}

          <p className="text-sm font-medium">Flows</p>

          {!flow.isTopLevel && (
            <p className="text-sm">
              <Currency>{flow.monthlyIncomingFlowRate || 0}</Currency>/month incoming flow.
            </p>
          )}
          <p className="text-sm">
            <Currency>{flow.monthlyOutgoingFlowRate || 0}</Currency>/month outgoing flow.
          </p>

          <p className="mb-2 text-sm font-medium">Flow Breakdown</p>
          <div className="grid grid-cols-2 gap-y-1 text-sm">
            <p className="text-muted-foreground">Baseline Pool:</p>
            <p className="text-right">
              <Currency>{flow.monthlyBaselinePoolFlowRate || 0}</Currency>/mo
              <span className="ml-1 text-muted-foreground">
                ({(baselinePercent / 1e4).toFixed(2)}%)
              </span>
            </p>

            <p className="text-muted-foreground">Bonus Pool:</p>
            <p className="text-right">
              <Currency>{flow.monthlyBonusPoolFlowRate || 0}</Currency>/mo
              <span className="ml-1 text-muted-foreground">
                ({(bonusPercent / 1e4).toFixed(2)}%)
              </span>
            </p>

            <p className="text-muted-foreground">Curator Rewards:</p>
            <p className="text-right">
              <Currency>{flow.monthlyRewardPoolFlowRate || 0}</Currency>/mo
              <span className="ml-1 text-muted-foreground">
                ({(managerPercent / 1e4).toFixed(2)}%)
              </span>
            </p>
          </div>

          <Link
            className="text-sm underline"
            href={explorerUrl(flow.recipient, base.id, "address")}
            target="_blank"
          >
            View on Explorer
          </Link>
          <ManageFlow flow={flow} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
