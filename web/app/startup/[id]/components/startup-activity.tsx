import "server-only"

import { ActivityCalendar } from "@/components/ui/activity-calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { unstable_cache } from "next/cache"
import { DateTime } from "@/components/ui/date-time"
import { getStartupActivity, getStartupUpdates } from "@/lib/database/queries/startup-updates"

interface Props {
  flowIds: string[]
  launchDate: Date
}

const MAX_LEVEL = 3

export async function StartupActivity(props: Props) {
  const { flowIds, launchDate } = props

  const sixMonthsAgo = new Date(new Date().setMonth(new Date().getMonth() - 6))
  const [activities, updates] = await Promise.all([
    unstable_cache(
      () => getStartupActivity(flowIds, sixMonthsAgo),
      [`activity-graph-grant-page-v3`],
      { revalidate: 180 },
    )(),
    getStartupUpdates(flowIds, sixMonthsAgo),
  ])

  return (
    <Card className="border border-border/40 bg-card/80 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Team&apos;s updates</CardTitle>
            <CardDescription className="mt-1.5 text-xs">
              {updates.count} since <DateTime shortDate date={launchDate} />
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="overflow-hidden">
          <ActivityCalendar
            data={activities}
            updates={updates.byDate}
            maxLevel={MAX_LEVEL}
            weekStart={1}
            blockSize={18}
            blockMargin={4}
            labels={{ legend: { less: "Less", more: "More" } }}
            hideTotalCount
            theme={{
              light: [
                "hsl(var(--secondary) / 0.2)",
                "hsl(var(--primary) / 0.18)",
                "hsl(var(--primary) / 0.6)",
                "hsl(var(--primary))",
              ],
              dark: [
                "hsl(var(--secondary) / 0.2)",
                "hsl(var(--primary) / 0.1)",
                "hsl(var(--primary) / 0.6)",
                "hsl(var(--primary))",
              ],
            }}
          />
        </div>
      </CardContent>
    </Card>
  )
}
