"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useActualFlowRate } from "@/lib/flows/hooks/use-actual-flow-rate"
import { useMaxSafeFlowRate } from "@/lib/flows/hooks/use-max-flow-rate"
import { useIncreaseFlowRate } from "@/lib/flows/hooks/use-increase-flow-rate"
import { formatUnits } from "viem"
import { TIME_UNIT } from "@/lib/erc20/super-token/operation-type"
import { ArrowUpIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAccount } from "wagmi"

interface RebalanceFlowButtonProps {
  contract: `0x${string}`
  chainId: number
  superToken: `0x${string}`
  underlyingToken: `0x${string}`
  className?: string
}

export function RebalanceFlowSection({
  contract,
  chainId,
  superToken,
  underlyingToken,
  className,
}: RebalanceFlowButtonProps) {
  const { address } = useAccount()
  const { actualFlowRate, refetch: refetchActualFlowRate } = useActualFlowRate(contract, chainId)
  const { maxSafeFlowRate, refetch: refetchMaxSafeFlowRate } = useMaxSafeFlowRate(contract, chainId)

  const { increaseFlowRate, isLoading } = useIncreaseFlowRate({
    contract,
    chainId,
    superToken,
    underlyingToken,
    userAddress: address as `0x${string}`,
    onSuccess: () => {
      refetchActualFlowRate()
      refetchMaxSafeFlowRate()
    },
  })

  // Amount to rebalance: the difference between max safe flow rate and actual flow rate
  const amount = maxSafeFlowRate - actualFlowRate

  const needsIncrease = amount > (maxSafeFlowRate * 1n) / 1000n

  if (amount === 0n || !needsIncrease) return null

  // Format for display
  const displayAmount = Number(formatUnits(amount * BigInt(TIME_UNIT.month), 18)).toFixed(0)

  // Determine button text based on state
  const getButtonText = () => {
    if (isLoading) {
      return "Increasing flow..."
    }

    return `Increase (+${displayAmount}/mo)`
  }

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
            onClick={async () => {
              await increaseFlowRate(amount)
            }}
            size="sm"
            className={cn("flex w-full items-center gap-2", className)}
            disabled={isLoading}
          >
            <ArrowUpIcon className="h-4 w-4" />
            {getButtonText()}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
