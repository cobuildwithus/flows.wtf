import { Badge } from "@/components/ui/badge"
import { Currency } from "@/components/ui/currency"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import type { FlowWithGrants } from "@/lib/database/queries/flow"
import { explorerUrl } from "@/lib/utils"
import Link from "next/link"
import { base } from "viem/chains"
import { ManageFlow } from "./management/management-dashboard"

interface Props {
  flow: FlowWithGrants
}

export const BudgetDialog = (props: Props) => {
  const { flow } = props

  const totalFlowRate =
    Number(flow.monthlyBaselinePoolFlowRate ?? 0) +
    Number(flow.monthlyBonusPoolFlowRate ?? 0) +
    Number(flow.monthlyRewardPoolFlowRate ?? 0)

  const baselinePercent = (Number(flow.monthlyBaselinePoolFlowRate ?? 0) / totalFlowRate) * 100
  const bonusPercent = (Number(flow.monthlyBonusPoolFlowRate ?? 0) / totalFlowRate) * 100
  const managerPercent = (Number(flow.monthlyRewardPoolFlowRate ?? 0) / totalFlowRate) * 100

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
        <div className="flex flex-col space-y-4">
          <h3 className="text-lg font-semibold">Min. Salary</h3>

          {flow.derivedData?.minimumSalary && (
            <p className="text-base">
              <Currency>{flow.derivedData.minimumSalary}</Currency>/month
            </p>
          )}

          <h3 className="text-lg font-semibold">Flows</h3>

          {!flow.isTopLevel && (
            <p className="text-base">
              <Currency>{flow.monthlyIncomingFlowRate || 0}</Currency>/month incoming flow.
            </p>
          )}
          <p className="text-base">
            <Currency>{flow.monthlyOutgoingFlowRate || 0}</Currency>/month outgoing flow.
          </p>

          <h3 className="mb-2 text-lg font-semibold">Flow Breakdown</h3>
          <div className="grid grid-cols-2 gap-y-2 text-base">
            <p className="text-muted-foreground">Baseline Pool:</p>
            <p className="text-right">
              <Currency>{flow.monthlyBaselinePoolFlowRate || 0}</Currency>/mo
              <span className="ml-1 text-muted-foreground">({baselinePercent.toFixed(2)}%)</span>
            </p>

            <p className="text-muted-foreground">Bonus Pool:</p>
            <p className="text-right">
              <Currency>{flow.monthlyBonusPoolFlowRate || 0}</Currency>/mo
              <span className="ml-1 text-muted-foreground">({bonusPercent.toFixed(2)}%)</span>
            </p>

            <p className="text-muted-foreground">Curator Rewards:</p>
            <p className="text-right">
              <Currency>{flow.monthlyRewardPoolFlowRate || 0}</Currency>/mo
              <span className="ml-1 text-muted-foreground">({managerPercent.toFixed(2)}%)</span>
            </p>
          </div>

          <Link
            className="text-base underline"
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
