import { cn } from "@/lib/utils"
import { Currency } from "./currency"
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip"
import { useERC20Supply } from "@/lib/tcr/use-erc20-supply"
import { useSellTokenQuote } from "@/app/token/hooks/useSellTokenQuote"
import { base } from "viem/chains"
import { TokenHolder } from "@prisma/flows"
import { formatUSDValue } from "@/app/token/hooks/useETHPrice"
import { formatEther } from "viem"

export const TcrTokenBalance = ({
  className,
  erc20,
  tokenEmitter,
  monthlyRewardPoolRate,
  ethPrice,
  holderInfo,
}: {
  holderInfo: TokenHolder
  className: string
  erc20: `0x${string}`
  tokenEmitter: `0x${string}`
  monthlyRewardPoolRate: string
  ethPrice: number
}) => {
  const { totalSupply } = useERC20Supply(erc20)
  const { payment: worthInETH } = useSellTokenQuote(
    tokenEmitter,
    BigInt(holderInfo.amount),
    base.id,
  )

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <TcrTokenBalanceWithTooltip
        holderInfo={holderInfo}
        totalSupply={totalSupply}
        monthlyRewardPoolRate={monthlyRewardPoolRate}
        worthInETH={worthInETH}
        ethPrice={ethPrice}
      />
    </div>
  )
}

const TcrTokenBalanceWithTooltip = ({
  totalSupply,
  monthlyRewardPoolRate,
  worthInETH,
  ethPrice,
  holderInfo,
}: {
  totalSupply: bigint
  monthlyRewardPoolRate: string
  worthInETH: bigint
  ethPrice: number
  holderInfo: TokenHolder
}) => {
  const { amount, costBasis, totalBought, totalSold, totalSaleProceeds } = holderInfo
  const balance = formatEther(BigInt(amount))
  const balanceUSD = formatUSDValue(ethPrice, worthInETH)
  const hasSold = Number(totalSold) > 0
  return (
    <Tooltip>
      <TooltipTrigger>
        <div className="flex flex-col items-end justify-between">
          <span>{balanceUSD}</span>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <div className="flex flex-col gap-4 p-1">
          <div className="mb-2 border-b border-border pb-2 text-sm">
            Earning {formatPercentage(balance, totalSupply)}% of the{" "}
            <Currency>{monthlyRewardPoolRate}</Currency>/mo pool
          </div>

          <div className="space-y-1">
            <div className="text-base font-medium">Details</div>
            <div className="grid grid-cols-2 justify-items-start gap-x-4 gap-y-1 text-sm">
              <div>Balance</div>
              <div className="justify-self-end">
                <Currency currency="ERC20">{amount}</Currency>
              </div>
              <div>ETH Value</div>
              <div className="justify-self-end">
                <Currency currency="ETH">{worthInETH}</Currency>
              </div>
              {false && (
                <>
                  <div>Cost Basis</div>
                  <div className="justify-self-end">
                    <Currency currency="ETH">{costBasis}</Currency>
                  </div>
                </>
              )}
            </div>
          </div>
          {hasSold && (
            <div className="space-y-1">
              <div className="text-base font-medium">Sales</div>
              <div className="grid grid-cols-2 justify-items-start gap-x-4 gap-y-1 text-sm">
                <div>Sold</div>
                <div className="justify-self-end">
                  <Currency currency="ERC20">{totalSold}</Currency>
                </div>
                <div>Sale Proceeds</div>
                <div className="justify-self-end">
                  <Currency currency="ETH">{totalSaleProceeds}</Currency>
                </div>
              </div>
            </div>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  )
}

function formatPercentage(balance: string, totalSupply: bigint) {
  const percentage = (Number(balance) / (Number(totalSupply) / 10 ** 18)) * 100
  const decimalPlaces = percentage < 1 ? 4 : percentage < 10 ? 1 : 0
  return percentage.toFixed(decimalPlaces)
}
