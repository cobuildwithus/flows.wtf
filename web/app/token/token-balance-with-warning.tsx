import { CostDifferenceTooltip } from "./cost-difference-tooltip"
import { TokenBalance } from "./token-balance"

import { formatUSDValue } from "./hooks/useETHPrice"

export const TokenBalanceWithWarning = ({
  ethPrice,
  costWithRewardsFee,
  rawCost,
  addedSurgeCost,
  balance,
}: {
  ethPrice: number
  costWithRewardsFee: bigint
  rawCost: bigint
  addedSurgeCost: bigint
  balance: bigint
}) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-1">
        <span className="text-xs text-gray-500 dark:text-white">
          {formatUSDValue(ethPrice || 0, costWithRewardsFee)}
        </span>
        <CostDifferenceTooltip
          rawCost={rawCost}
          addedSurgeCost={addedSurgeCost}
          costWithRewardsFee={costWithRewardsFee}
        />
      </div>
      <TokenBalance balance={balance} />
    </div>
  )
}
