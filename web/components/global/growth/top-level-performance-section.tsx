"use server"

import { cn } from "@/lib/utils"
import { Currency } from "@/components/ui/currency"
import { ChevronDown } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { getRemovedGrantsForTopLevel } from "@/lib/database/queries/get-removed-grants"
import { Stat } from "@/app/item/[grantId]/cards/stats"
import { RugRateExplainerDialog } from "./rug-rate-explainer"

interface Props {
  defaultOpen?: boolean
  topLevelPaidOut: number
  className?: string
}

export default async function TopLevelPerformanceSection(props: Props) {
  const { defaultOpen = true, className, topLevelPaidOut } = props

  const removedGrants = await getRemovedGrantsForTopLevel()

  const hasRemovedGrants = removedGrants.length > 0

  if (!hasRemovedGrants) return null

  return (
    <div className={cn(className)}>
      <Collapsible defaultOpen={defaultOpen}>
        <CollapsibleTrigger className="mb-4 flex w-full items-center justify-between hover:opacity-70">
          <span className="font-semibold text-muted-foreground md:text-xl">Performance</span>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-12 gap-x-2 gap-y-4 py-1 lg:gap-x-4">
              <div className="col-span-full xl:col-span-3">
                <Stat label="Total paid out">
                  <Currency>{topLevelPaidOut}</Currency>
                </Stat>
              </div>
              <RugRateExplainerDialog
                removedGrants={removedGrants}
                totalPaidOut={topLevelPaidOut}
              />
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
