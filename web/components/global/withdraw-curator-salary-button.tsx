import { Button, ButtonProps } from "@/components/ui/button"
import { Currency } from "@/components/ui/currency"
import { Tooltip, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { DownloadIcon } from "@radix-ui/react-icons"
import { useBulkPoolWithdrawMacro } from "./hooks/use-bulk-pool-withdraw-macro"
import { useClaimablePoolBalance } from "./hooks/use-claimable-pool-balance"

export const WithdrawCuratorSalaryButton = ({
  pool,
  size = "xs",
}: {
  pool: `0x${string}`
  size?: ButtonProps["size"]
}) => {
  const { balance, isLoading, refetch } = useClaimablePoolBalance(pool)

  const { withdraw } = useBulkPoolWithdrawMacro([pool], () => refetch())

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          className={cn({ "text-green-500": Number(balance) > 1e17 })}
          size={size}
          onClick={() => {
            withdraw()
          }}
          variant="ghost"
          disabled={balance === BigInt(0) || isLoading}
        >
          <Currency className="text-center text-sm">{Number(balance) / 1e18}</Currency>
          <DownloadIcon className="ml-1 size-3.5" />
        </Button>
      </TooltipTrigger>
    </Tooltip>
  )
}
