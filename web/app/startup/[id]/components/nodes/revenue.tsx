"use client"

import { PercentChange } from "@/components/ui/percent-change"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { Revenue } from "@/lib/onchain-startup/types"

interface Props {
  revenue: Revenue
}

export function Revenue({ revenue }: Props) {
  return (
    <div className="pointer-events-auto flex flex-col justify-between text-sm text-muted-foreground">
      <div>
        <Tooltip>
          <TooltipTrigger>
            <div className="flex items-center gap-2">
              <PercentChange value={revenue.salesChange} className="text-sm" />
              <span className="text-sm">in the last month</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>Monthly revenue growth</TooltipContent>
        </Tooltip>
      </div>
    </div>
  )
}
