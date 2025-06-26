"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useActualFlowRate } from "@/lib/flows/hooks/use-actual-flow-rate"
import { useMaxSafeFlowRate } from "@/lib/flows/hooks/use-max-flow-rate"
import { useFlowRateTooHigh } from "@/lib/flows/hooks/use-flow-rate-too-high"
import { useExistingFlows } from "@/lib/superfluid/use-existing-flows"
import { useIncreaseFlowRate } from "@/lib/flows/hooks/use-increase-flow-rate"
import { useDecreaseFlowRate } from "@/lib/flows/hooks/use-decrease-flow-rate"
import { formatUnits } from "viem"
import { useRouter } from "next/navigation"
import { TIME_UNIT } from "@/lib/erc20/super-token/operation-type"
import { ArrowUpIcon, ArrowDownIcon, CheckIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface RebalanceFlowButtonProps {
  contract: `0x${string}`
  chainId: number
  address: string
  receiver: string
  superToken: `0x${string}`
  className?: string
}

export function RebalanceFlowButton({
  contract,
  chainId,
  address,
  receiver,
  superToken,
  className,
}: RebalanceFlowButtonProps) {
  const router = useRouter()
  const {
    actualFlowRate,
    isLoading: actualLoading,
    refetch: mutateActual,
  } = useActualFlowRate(contract, chainId)
  const {
    actualFlowRate: maxFlowRate,
    isLoading: maxLoading,
    refetch: mutateMax,
  } = useMaxSafeFlowRate(contract, chainId)
  const {
    isFlowRateTooHigh,
    isLoading: tooHighLoading,
    refetch: mutateTooHigh,
  } = useFlowRateTooHigh(contract, chainId)
  const { data: existingFlows, isLoading: flowsLoading } = useExistingFlows(
    address,
    chainId,
    receiver,
  )

  const onSuccess = () => {
    mutateActual()
    mutateMax()
    mutateTooHigh()
    router.refresh()
  }

  const {
    increaseFlowRate,
    isLoading: increaseLoading,
    needsApproval,
  } = useIncreaseFlowRate({
    contract,
    chainId,
    superToken,
    userAddress: address as `0x${string}`,
    onSuccess,
  })

  const { decreaseFlowRate, isLoading: decreaseLoading } = useDecreaseFlowRate({
    contract,
    chainId,
    onSuccess,
  })

  const isLoading = actualLoading || maxLoading || tooHighLoading || flowsLoading

  // User's current flow rate to this receiver
  const userFlowRate =
    existingFlows?.reduce((total, flow) => total + BigInt(flow.flowRate), 0n) || 0n

  // Determine if we need to increase or decrease
  const needsDecrease = isFlowRateTooHigh
  const needsIncrease = !needsDecrease && actualFlowRate < (maxFlowRate * 99n) / 100n

  // Only show if not loading, should rebalance, and user has a flow
  const shouldShow = !isLoading && userFlowRate > 0n && (needsDecrease || needsIncrease)

  if (!shouldShow) return null

  // Amount to rebalance: the minimum between what can be increased and what the user is sending
  const amount = needsIncrease
    ? BigInt(Math.min(Number(userFlowRate), Number(maxFlowRate - actualFlowRate)))
    : userFlowRate

  if (amount === 0n) return null

  // Format for display
  const displayAmount = Number(formatUnits(amount * BigInt(TIME_UNIT.month), 18)).toFixed(0)

  const handleRebalance = async () => {
    if (needsDecrease) {
      await decreaseFlowRate()
    } else if (needsIncrease) {
      await increaseFlowRate(amount)
    }
  }

  const isTransactionLoading = increaseLoading || decreaseLoading

  // Determine button text based on state
  const getButtonText = () => {
    if (isTransactionLoading) {
      if (needsDecrease) return "Reducing flow..."
      return needsApproval(amount) ? "Approving..." : "Increasing flow..."
    }

    if (needsDecrease) {
      return `Reduce (-${displayAmount}/mo)`
    }

    if (needsApproval(amount)) {
      return `Approve (+${displayAmount}/mo)`
    }

    return `Increase (+${displayAmount}/mo)`
  }

  // Determine button variant and icon
  const buttonVariant = needsDecrease ? "outline" : "default"
  const ButtonIcon = needsDecrease ? ArrowDownIcon : ArrowUpIcon

  return (
    <Card className="border-l-4 border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20">
      <CardContent className="p-2 md:p-4">
        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">Rebalance flow</h4>
            <p className="text-xs text-blue-700 dark:text-blue-300">
              {needsDecrease ? "The flow rate is too high" : "You can increase the flow rate"}
            </p>
          </div>

          <Button
            onClick={handleRebalance}
            variant={buttonVariant}
            size="sm"
            className={cn("flex w-full items-center gap-2", className)}
            disabled={isTransactionLoading}
          >
            <ButtonIcon className="h-4 w-4" />
            {getButtonText()}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
