"use client"

import { Button, ButtonProps } from "@/components/ui/button"
import { Currency } from "@/components/ui/currency"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { DownloadIcon } from "@radix-ui/react-icons"
import { useClaimableFlowsBalance } from "./hooks/use-claimable-flows-balance"
import { useBulkPoolWithdrawMacro } from "./hooks/use-bulk-pool-withdraw-macro"

export const WithdrawSalaryButton = ({
  pools,
  flow,
  builder,
  size = "sm",
  onSuccess,
}: {
  pools: `0x${string}`[]
  flow: `0x${string}`
  builder: `0x${string}`
  size?: ButtonProps["size"]
  onSuccess?: () => void
}) => {
  const { withdraw } = useBulkPoolWithdrawMacro(pools, onSuccess)

  const { balance, isLoading } = useClaimableFlowsBalance(flow, builder)

  const getTextSize = (size: ButtonProps["size"]) => {
    switch (size) {
      case "xs":
        return "text-xs"
      case "sm":
        return "text-sm"
      case "default":
        return "text-base"
      case "lg":
        return "text-lg"
      default:
        return "text-sm"
    }
  }

  const getIconSize = (size: ButtonProps["size"]) => {
    switch (size) {
      case "xs":
        return "size-3"
      case "sm":
        return "size-3.5"
      case "default":
        return "size-4"
      case "lg":
        return "size-5"
      default:
        return "size-3.5"
    }
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          className={cn({ "text-green-600 dark:text-green-500": Number(balance) > 1e17 })}
          size={size}
          onClick={() => {
            withdraw()
          }}
          variant="ghost"
          disabled={balance === BigInt(0) || isLoading}
        >
          <Currency className={cn("text-center", getTextSize(size))}>
            {Number(balance) / 1e18}
          </Currency>
          <DownloadIcon className={cn("ml-1", getIconSize(size))} />
        </Button>
      </TooltipTrigger>
      {balance === BigInt(0) && !isLoading && (
        <TooltipContent>No rewards to withdraw</TooltipContent>
      )}
    </Tooltip>
  )
}
