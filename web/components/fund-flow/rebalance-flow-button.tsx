"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useActualFlowRate } from "@/lib/flows/hooks/use-actual-flow-rate"
import { useMaxSafeFlowRate } from "@/lib/flows/hooks/use-max-flow-rate"
import { useExistingFlows } from "@/lib/superfluid/use-existing-flows"
import { useIncreaseFlowRate } from "@/lib/flows/hooks/use-increase-flow-rate"
import { formatUnits } from "viem"
import { useRouter } from "next/navigation"
import { TIME_UNIT } from "@/lib/erc20/super-token/operation-type"
import { ArrowUpIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface RebalanceFlowButtonProps {
  contract: `0x${string}`
  chainId: number
  address: string
  receiver: string
  superToken: `0x${string}`
  underlyingToken: `0x${string}`
  className?: string
}

export function RebalanceFlowButton({
  contract,
  chainId,
  address,
  receiver,
  superToken,
  underlyingToken,
  className,
}: RebalanceFlowButtonProps) {
  const router = useRouter()
  const { actualFlowRate, isLoading: actualLoading } = useActualFlowRate(contract, chainId)
  const { maxSafeFlowRate, isLoading: maxLoading } = useMaxSafeFlowRate(contract, chainId)
  const { data: existingFlows, isLoading: flowsLoading } = useExistingFlows(
    address,
    chainId,
    receiver,
  )

  const { increaseFlowRate, isLoading: increaseLoading } = useIncreaseFlowRate({
    contract,
    chainId,
    superToken,
    underlyingToken,
    userAddress: address as `0x${string}`,
    onSuccess: () => {
      router.refresh()
    },
  })

  const isLoading = actualLoading || maxLoading || flowsLoading

  // User's current flow rate to this receiver
  const userFlowRate =
    existingFlows?.reduce((total, flow) => total + BigInt(flow.flowRate), 0n) || 0n

  const difference = maxSafeFlowRate - actualFlowRate
  const needsIncrease = difference > (maxSafeFlowRate * 1n) / 100n

  // Only show if not loading, should rebalance, and user has a flow
  const shouldShow = !isLoading && userFlowRate > 0n && needsIncrease

  if (!shouldShow) return null

  // Amount to rebalance: the minimum between what can be increased and what the user is sending
  const amount = needsIncrease ? maxSafeFlowRate - actualFlowRate : maxSafeFlowRate - actualFlowRate

  if (amount === 0n) return null

  // Format for display
  const displayAmount = Number(formatUnits(amount * BigInt(TIME_UNIT.month), 18)).toFixed(0)

  const handleRebalance = async () => {
    await increaseFlowRate(amount)
  }

  const isTransactionLoading = increaseLoading

  // Determine button text based on state
  const getButtonText = () => {
    if (isTransactionLoading) {
      return "Increasing flow..."
    }

    return `Increase (+${displayAmount}/mo)`
  }

  const ButtonIcon = ArrowUpIcon

  return (
    <Card className="border-l-4 border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20">
      <CardContent className="p-2 md:p-3">
        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">Rebalance flow</h4>
            <p className="text-xs text-blue-700 dark:text-blue-300">
              You should increase the flow rate
            </p>
          </div>

          <Button
            onClick={handleRebalance}
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
