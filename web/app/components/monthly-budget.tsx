import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { Currency } from "@/components/ui/currency"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import pluralize from "pluralize"
import type { Grant } from "@prisma/flows"
import { Prisma } from "@prisma/flows"
import { fromWei } from "@/lib/utils"

export type FlowWithBudget = Pick<
  Grant,
  | "isFlow"
  | "monthlyOutgoingFlowRate"
  | "monthlyIncomingFlowRate"
  | "monthlyIncomingBaselineFlowRate"
  | "monthlyIncomingBonusFlowRate"
  | "monthlyBaselinePoolFlowRate"
  | "monthlyBonusPoolFlowRate"
  | "baselineMemberUnits"
  | "bonusMemberUnits"
  | "underlyingTokenSymbol"
  | "underlyingTokenPrefix"
  | "underlyingTokenDecimals"
>

interface Props {
  flow: FlowWithBudget
  approvedGrants?: number
  display: string
}

export const MonthlyBudget = ({ flow, approvedGrants, display }: Props) => {
  const decimals = 18
  const toTokens = (raw: string | number | Prisma.Decimal) => fromWei(raw, decimals)
  const monthlyOutgoingFlowRate = toTokens(flow.monthlyOutgoingFlowRate)
  const isFlow = flow.isFlow

  return (
    <Tooltip>
      <TooltipTrigger tabIndex={-1}>
        <Badge variant="default">
          <Currency display={flow}>{Math.ceil(toTokens(display))}</Currency>
          /mo
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        {approvedGrants ? (
          <>
            Streaming <Currency display={flow}>{monthlyOutgoingFlowRate}</Currency>
            /mo to {approvedGrants} {pluralize("builder", approvedGrants)}.
          </>
        ) : isFlow ? (
          <>
            Streaming <Currency display={flow}>{monthlyOutgoingFlowRate}</Currency>
            /mo to builders.
          </>
        ) : (
          <>
            <Currency display={flow}>{toTokens(flow.monthlyIncomingBaselineFlowRate)}</Currency>
            /mo baseline grant.
            <br />
            {toTokens(flow.monthlyIncomingBonusFlowRate) < 1 ? (
              "No bonus from voters."
            ) : (
              <>
                <Currency display={flow}>{toTokens(flow.monthlyIncomingBonusFlowRate)}</Currency>
                /mo as a bonus from voters.
              </>
            )}
          </>
        )}
      </TooltipContent>
    </Tooltip>
  )
}
