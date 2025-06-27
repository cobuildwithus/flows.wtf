"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ArrowDownIcon, ArrowUpIcon, InfoIcon } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Currency } from "@/components/ui/currency"
import type { FlowWithGrants } from "@/lib/database/queries/flow"
import { explorerUrl } from "@/lib/utils"
import Link from "next/link"
import { Separator } from "@radix-ui/react-select"

interface Props {
  flow: FlowWithGrants
  totalAllocationWeight: number
}

export const BudgetDialog = (props: Props) => {
  const { flow, totalAllocationWeight } = props
  const tokenVoteWeight = 1000

  const managerFlowRatePercent = Number(flow.managerRewardPoolFlowRatePercent)
  const remainingFlowRatePercent = 1e6 - managerFlowRatePercent
  const baselineFlowRatePercent =
    (remainingFlowRatePercent * Number(flow.baselinePoolFlowRatePercent)) / 1e6
  const bonusFlowRatePercent = remainingFlowRatePercent - baselineFlowRatePercent

  const totalFlowRate =
    Number(flow.monthlyBaselinePoolFlowRate ?? 0) +
    Number(flow.monthlyBonusPoolFlowRate ?? 0) +
    Number(flow.monthlyRewardPoolFlowRate ?? 0)

  const baselinePercent = (Number(flow.monthlyBaselinePoolFlowRate ?? 0) / totalFlowRate) * 100
  const bonusPercent = (Number(flow.monthlyBonusPoolFlowRate ?? 0) / totalFlowRate) * 100
  const managerPercent = (Number(flow.monthlyRewardPoolFlowRate ?? 0) / totalFlowRate) * 100

  const currentVotes = Number(flow.totalAllocationWeightOnFlow) / 1e18
  const requiredVotes = (totalAllocationWeight * tokenVoteWeight * flow.bonusPoolQuorum) / 1e6

  const quorumData = {
    quorumPercentage: (currentVotes / requiredVotes) * 100,
    currentVotes,
    requiredVotes,
  }

  const hasMinimumSalary = (flow.derivedData?.minimumSalary || 0) > 0
  const hasQuorum = (flow.bonusPoolQuorum || 0) > 0

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Badge className="cursor-help">
          <Currency flow={flow}>
            {(flow.subgrants.length > 0
              ? flow.monthlyOutgoingFlowRate
              : flow.monthlyIncomingFlowRate
            ).toString()}
          </Currency>{" "}
          /mo
        </Badge>
      </DialogTrigger>
      <DialogContent className="p-12 md:min-w-[600px]">
        {hasMinimumSalary ||
          (hasQuorum && (
            <Card>
              <CardContent className="space-y-8">
                {/* Minimum Funding Section */}
                {hasMinimumSalary && (
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h3 className="text-sm font-medium text-muted-foreground">Min. Funding</h3>
                      <p className="text-2xl font-bold">
                        <Currency flow={flow}>{flow.derivedData?.minimumSalary || 0}</Currency>
                        /month
                      </p>
                    </div>
                    <div className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                      Guaranteed
                    </div>
                  </div>
                )}

                {hasQuorum && (
                  <>
                    <Separator />

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <TooltipProvider delayDuration={0}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="flex cursor-pointer items-center gap-2">
                                Quorum
                                <InfoIcon className="h-4 w-4 text-muted-foreground" />
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              When full quorum
                              <br />
                              is reached, the bonus
                              <br />
                              pool will be {bonusFlowRatePercent / 1e4}% of
                              <br />
                              the total flow.
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <span className="text-sm font-medium">
                          {formatValue(quorumData.currentVotes)}/
                          {formatValue(quorumData.requiredVotes)} votes
                        </span>
                      </div>
                      <Progress value={quorumData.quorumPercentage} className="h-2" />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))}

        <Card>
          <CardContent className="space-y-6">
            {/* Total Flows Section */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex items-center space-x-4">
                <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900/30">
                  <ArrowDownIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Incoming Flow</p>
                  <p className="text-xl font-bold">
                    <Currency flow={flow}>{flow.monthlyIncomingFlowRate || 0}</Currency>
                    /month
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="rounded-full bg-green-100 p-2 dark:bg-green-900/30">
                  <ArrowUpIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Outgoing Flow</p>
                  <p className="text-xl font-bold">
                    <Currency flow={flow}>{flow.monthlyOutgoingFlowRate || 0}</Currency>
                    /month
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <TooltipProvider delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="flex cursor-pointer items-center gap-2 font-medium">
                        Baseline Pool
                        <InfoIcon className="h-4 w-4 text-muted-foreground" />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>Split equally between all builders.</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <span className="font-medium">
                  <Currency flow={flow}>{flow.monthlyBaselinePoolFlowRate || 0}</Currency>
                  /mo
                </span>
              </div>
              <Progress value={baselinePercent} className="h-2" />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <TooltipProvider delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="flex cursor-pointer items-center gap-2 font-medium">
                        Bonus Pool
                        <InfoIcon className="h-4 w-4 text-muted-foreground" />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>Bonus payment based on votes.</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <span className="font-medium">
                  <Currency flow={flow}>{flow.monthlyBonusPoolFlowRate || 0}</Currency>
                  /mo
                </span>
              </div>
              <Progress value={bonusPercent} className="h-2" />
            </div>

            {/* <div className="space-y-4">
              <div className="flex items-center justify-between">
                <TooltipProvider delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="flex cursor-pointer items-center gap-2 font-medium">
                        Curator Rewards
                        <InfoIcon className="h-4 w-4 text-muted-foreground" />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>Fixed percentage for curators.</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <span className="font-medium">
                  <Currency flow={flow}>{flow.monthlyRewardPoolFlowRate || 0}</Currency>
                  /mo
                </span>
              </div>
              <Progress value={managerPercent} className="h-2" />
            </div> */}
          </CardContent>
        </Card>

        <Link
          className="text-base underline"
          href={explorerUrl(flow.recipient, flow.chainId, "address")}
          target="_blank"
        >
          View on Explorer
        </Link>
      </DialogContent>
    </Dialog>
  )
}

function formatValue(value: number) {
  if (value >= 1000000) {
    const millions = value / 1000000
    const roundedMillions = Math.round(millions * 10) / 10
    return `${millions.toFixed(roundedMillions % 1 === 0 ? 0 : 1)}M`
  }
  if (value >= 1000) {
    const thousands = value / 1000
    const roundedThousands = Math.round(thousands * 10) / 10
    return `${thousands.toFixed(roundedThousands % 1 === 0 ? 0 : 1)}k`
  }
  return value.toFixed(0)
}
