import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { Currency } from "@/components/ui/currency"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import pluralize from "pluralize"
import type { Grant } from "@prisma/flows"

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
  | "superTokenSymbol"
  | "superTokenPrefix"
>

interface Props {
  flow: FlowWithBudget
  approvedGrants?: number
  display: string
}

export const MonthlyBudget = ({ flow, approvedGrants, display }: Props) => {
  const monthlyOutgoingFlowRate = Number(flow.monthlyOutgoingFlowRate)
  const monthlyIncomingFlowRate = Number(flow.monthlyIncomingFlowRate)
  const isFlow = flow.isFlow

  const isGoingNegative = monthlyOutgoingFlowRate > monthlyIncomingFlowRate

  const isNotStreamingEnough = isFlow && monthlyIncomingFlowRate * 0.99 > monthlyOutgoingFlowRate

  const absDifference = Math.abs(monthlyOutgoingFlowRate - monthlyIncomingFlowRate)
  const isGoingNegativeSignificant =
    isGoingNegative && absDifference / monthlyOutgoingFlowRate > 0.001

  return (
    <Tooltip>
      <TooltipTrigger tabIndex={-1}>
        <Badge variant={isGoingNegative ? "warning" : "default"}>
          <Currency tokenSymbol={flow.superTokenSymbol} tokenPrefix={flow.superTokenPrefix}>
            {Math.ceil(Number(display))}
          </Currency>
          /mo
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        {isGoingNegative ? (
          <>
            Warning: More outgoing funds than incoming.{" "}
            <Currency tokenSymbol={flow.superTokenSymbol} tokenPrefix={flow.superTokenPrefix}>
              {monthlyOutgoingFlowRate}
            </Currency>{" "}
            vs{" "}
            <Currency tokenSymbol={flow.superTokenSymbol} tokenPrefix={flow.superTokenPrefix}>
              {monthlyIncomingFlowRate}
            </Currency>
            .
            {isGoingNegativeSignificant && (
              <>
                <br /> This will be automatically fixed within 1 minute.
              </>
            )}
          </>
        ) : isNotStreamingEnough ? (
          <>
            Warning: Not streaming enough funds.{" "}
            <Currency tokenSymbol={flow.superTokenSymbol} tokenPrefix={flow.superTokenPrefix}>
              {monthlyIncomingFlowRate}
            </Currency>{" "}
            vs{" "}
            <Currency tokenSymbol={flow.superTokenSymbol} tokenPrefix={flow.superTokenPrefix}>
              {monthlyOutgoingFlowRate}
            </Currency>
            .
            {isGoingNegativeSignificant && (
              <>
                <br /> This will be automatically fixed within 1 minute.
              </>
            )}
          </>
        ) : approvedGrants ? (
          <>
            Streaming{" "}
            <Currency tokenSymbol={flow.superTokenSymbol} tokenPrefix={flow.superTokenPrefix}>
              {monthlyOutgoingFlowRate}
            </Currency>
            /mo to {approvedGrants} {pluralize("builder", approvedGrants)}.
          </>
        ) : isFlow ? (
          <>
            Streaming{" "}
            <Currency tokenSymbol={flow.superTokenSymbol} tokenPrefix={flow.superTokenPrefix}>
              {monthlyOutgoingFlowRate}
            </Currency>
            /mo to builders.
          </>
        ) : (
          <>
            <Currency tokenSymbol={flow.superTokenSymbol} tokenPrefix={flow.superTokenPrefix}>
              {Number(flow.monthlyIncomingBaselineFlowRate)}
            </Currency>
            /mo baseline grant.
            <br />
            {Number(flow.monthlyIncomingBonusFlowRate) < 1 ? (
              "No bonus from voters."
            ) : (
              <>
                <Currency tokenSymbol={flow.superTokenSymbol} tokenPrefix={flow.superTokenPrefix}>
                  {Number(flow.monthlyIncomingBonusFlowRate)}
                </Currency>
                /mo as a bonus from voters.
              </>
            )}
          </>
        )}
      </TooltipContent>
    </Tooltip>
  )
}
