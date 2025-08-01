import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PercentChange } from "@/components/ui/percent-change"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { LucideIcon } from "lucide-react"
import { ReactNode } from "react"

interface MetricCardProps {
  title: string
  value: string | ReactNode
  change?: number
  icon: LucideIcon
}

export function MetricCard({ title, value, change, icon: Icon }: MetricCardProps) {
  return (
    <Card className="border border-border/40 bg-card/80 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="size-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-start space-x-3">
          <div className="text-2xl font-semibold tracking-tight">{value}</div>
          {change !== undefined && (
            <CardDescription className="pb-1 text-xs">
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <PercentChange value={change} className="text-xs" />
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>since last month</p>
                </TooltipContent>
              </Tooltip>
            </CardDescription>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
