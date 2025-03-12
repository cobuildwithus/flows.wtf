import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

export const CostDifferenceTooltip = ({
  rawCost,
  addedSurgeCost,
  costWithRewardsFee,
}: {
  rawCost: number
  addedSurgeCost: number
  costWithRewardsFee: number
}) => {
  const rawCostMinusSurge = rawCost - addedSurgeCost
  // calculate % difference between costWithRewardsFee and rawCost
  const costDifference = rawCost !== 0 ? ((costWithRewardsFee - rawCost) / rawCost) * 100 : 0
  const surgeCostDifference =
    rawCostMinusSurge !== 0 ? (addedSurgeCost / rawCostMinusSurge) * 100 : 0
  const isSurging = costDifference < surgeCostDifference

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={cn("text-xs text-gray-500 dark:text-gray-50", {
            "text-yellow-500 dark:text-yellow-500": isSurging && surgeCostDifference > 10,
            "text-red-500 dark:text-red-500": isSurging && surgeCostDifference > 50,
            "opacity-50": !isSurging,
          })}
        >
          ({isSurging ? `-${surgeCostDifference.toFixed(2)}%` : `${costDifference.toFixed(2)}%`})
        </span>
      </TooltipTrigger>
      {isSurging ? (
        <TooltipContent side="top" className="max-w-[220px]">
          Your purchase will occur ahead of the expected token issuance schedule. You can wait for
          prices to drop or pay {surgeCostDifference.toFixed(2)}% more to buy now.
        </TooltipContent>
      ) : (
        <TooltipContent side="top" className="max-w-[200px]">
          You pay a {costDifference.toFixed(2)}% protocol rewards fee on top of the purchase price.
        </TooltipContent>
      )}
    </Tooltip>
  )
}
