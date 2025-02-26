import "server-only"

import { ActivityCalendar } from "@/components/ui/activity-calendar"
import type { Grant } from "@prisma/flows"
import { unstable_cache } from "next/cache"
import { getActivity, getGrantUpdates } from "@/lib/database/queries/grant"
import pluralize from "pluralize"

interface Props {
  grants: Pick<Grant, "id" | "recipient">[]
}

const MAX_LEVEL = 3

export async function HomepageActivity(props: Props) {
  const { grants } = props

  const sixMonthsAgo = new Date()
  // make a bit less than 6 months ago so it fits the graph
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
  sixMonthsAgo.setDate(sixMonthsAgo.getDate() + 10)

  const [activities, updates] = await Promise.all([
    unstable_cache(
      () => getActivity(grants[0].recipient, grants, sixMonthsAgo),
      [`activity-graph-v13-${grants[0].id}`],
      {
        revalidate: 180,
      },
    )(),
    getGrantUpdates(
      grants.map((grant) => grant.id),
      sixMonthsAgo,
    ),
  ])

  const contributions = updates.count

  return (
    <div className="flex h-full flex-col items-center justify-start overflow-x-auto max-md:px-5 max-md:pb-7 md:pt-12">
      <div className="mb-4 mt-8 w-full text-left md:hidden">
        <h2 className="font-medium text-secondary-foreground">
          {contributions} {pluralize("update", contributions)} in the last 6 mo.
        </h2>
      </div>

      <ActivityCalendar
        data={activities}
        updates={structuredClone(updates.byDate)}
        maxLevel={MAX_LEVEL}
        weekStart={1}
        blockSize={19}
        blockMargin={4}
        hideColorLegend
        labels={{ legend: { less: "Less", more: "More" } }}
        hideTotalCount
        theme={{
          light: [
            "hsl(var(--secondary) / 0.2)",
            "hsl(var(--primary) / 0.1)",
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

      <div className="mt-2.5 hidden w-full text-left text-xs tracking-tight text-muted-foreground md:block xl:px-7">
        {contributions} {pluralize("contribution", contributions)}
      </div>
    </div>
  )
}
