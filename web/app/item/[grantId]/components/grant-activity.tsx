import "server-only"

import { ActivityCalendar } from "@/components/ui/activity-calendar"
import { getActivity, getGrantUpdates } from "@/lib/database/queries/grant-updates"
import type { Grant } from "@prisma/flows"
import { unstable_cache } from "next/cache"
import pluralize from "pluralize"
import { DateTime } from "@/components/ui/date-time"

interface Props {
  grant: Pick<Grant, "id" | "recipient" | "createdAt">
}

const MAX_LEVEL = 3

export async function GrantActivity(props: Props) {
  const { grant } = props

  const sixMonthsAgo = new Date(new Date().setMonth(new Date().getMonth() - 6))
  const [activities, updates] = await Promise.all([
    unstable_cache(
      () => getActivity(grant.recipient, [grant], sixMonthsAgo),
      [`activity-graph-grant-page-v3-${grant.id}`],
      { revalidate: 180 },
    )(),
    getGrantUpdates([grant], sixMonthsAgo),
  ])

  const startDate = new Date(grant.createdAt * 1000)
  return (
    <div className="flex w-full items-center justify-center p-5">
      <div className="max-lg:w-full max-lg:max-w-full">
        <h3 className="font-bold tracking-tight">Activity</h3>
        <p className="mb-6 mt-0.5 text-sm tracking-tight text-muted-foreground">
          {updates.count} {pluralize("update", updates.count)} since{" "}
          <DateTime shortDate date={startDate} />
        </p>

        <ActivityCalendar
          data={activities}
          updates={updates.byDate}
          maxLevel={MAX_LEVEL}
          weekStart={1}
          blockSize={16}
          blockMargin={3}
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
    </div>
  )
}
