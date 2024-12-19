import { formatUSDValue } from "./hooks/useETHPrice"
import { TokenBalance } from "./token-balance"

export const TokenBalanceAndUSDValue = ({
  balance,
  ethPrice,
  ethAmount,
}: {
  balance: bigint
  ethPrice: number
  ethAmount: bigint
}) => (
  <div className="flex items-center justify-between">
    <span className="text-xs text-gray-500 dark:text-white">
      {formatUSDValue(ethPrice || 0, ethAmount)}
    </span>
    <TokenBalance balance={balance} />
  </div>
)
