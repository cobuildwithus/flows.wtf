"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ArrowDownIcon, ArrowUpIcon, InfoIcon } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Currency } from "@/components/ui/currency"
import type { FlowWithGrants } from "@/lib/database/queries/flow"
import { explorerUrl } from "@/lib/utils"
import Link from "next/link"
import { base } from "viem/chains"
import { ManageFlow } from "./management/management-dashboard"
import { Separator } from "@radix-ui/react-select"

interface Props {
  flow: FlowWithGrants
}

export const BudgetDialog = (props: Props) => {
  const { flow } = props

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

  // Sample quorum data
  const quorumData = {
    quorumPercentage: 45,
    currentVotes: 450,
    requiredVotes: 1000,
    maxPotentialAmount: 1191,
  }

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
      <DialogContent className="p-12 md:min-w-[600px]">
        <Card>
          <CardContent className="space-y-8">
            {/* Minimum Salary Section */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-muted-foreground">Minimum Salary</h3>
                <p className="text-2xl font-bold">
                  <Currency>{flow.derivedData?.minimumSalary || 0}</Currency>/month
                </p>
              </div>
              <div className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                Guaranteed
              </div>
            </div>

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
                      At quorum the bonus
                      <br />
                      pool is {bonusFlowRatePercent / 1e4}% of
                      <br />
                      the total flow.
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <span className="text-sm font-medium">
                  {quorumData.currentVotes}/{quorumData.requiredVotes} votes
                </span>
              </div>
              <Progress value={quorumData.quorumPercentage} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-6">
            {/* Total Flows Section */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex items-center space-x-4">
                <div className="rounded-full bg-green-100 p-2 dark:bg-green-900/30">
                  <ArrowDownIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Incoming Flow</p>
                  <p className="text-xl font-bold">
                    <Currency>{flow.monthlyIncomingFlowRate || 0}</Currency>/month
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900/30">
                  <ArrowUpIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Outgoing Flow</p>
                  <p className="text-xl font-bold">
                    <Currency>{flow.monthlyOutgoingFlowRate || 0}</Currency>/month
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
                  <Currency>{flow.monthlyBaselinePoolFlowRate || 0}</Currency>/mo
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
                  <Currency>{flow.monthlyBonusPoolFlowRate || 0}</Currency>/mo
                </span>
              </div>
              <Progress value={bonusPercent} className="h-2" />
            </div>

            <div className="space-y-4">
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
                  <Currency>{flow.monthlyRewardPoolFlowRate || 0}</Currency>/mo
                </span>
              </div>
              <Progress value={managerPercent} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Link
          className="text-base underline"
          href={explorerUrl(flow.recipient, base.id, "address")}
          target="_blank"
        >
          View on Explorer
        </Link>
        <ManageFlow flow={flow} />
      </DialogContent>
    </Dialog>
  )
}
