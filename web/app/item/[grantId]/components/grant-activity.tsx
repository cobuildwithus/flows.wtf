import "server-only"

import { ActivityCalendar } from "@/components/ui/activity-calendar"
import { Grant } from "@prisma/flows"
import { unstable_cache } from "next/cache"
import { getActivity, getGrantUpdates } from "@/lib/database/queries/grant"
import pluralize from "pluralize"

interface Props {
  grant: Pick<Grant, "id" | "recipient">
}

const MAX_LEVEL = 3

export async function GrantActivity(props: Props) {
  const { grant } = props

  const nineMonthsAgo = new Date(new Date().setMonth(new Date().getMonth() - 9))
  const [{ activities, storiesCount }, updates] = await Promise.all([
    unstable_cache(
      () => getActivity(grant.recipient, [grant], nineMonthsAgo),
      [`activity-graph-grant-page-${grant.id}`],
      {
        revalidate: 180,
      },
    )(),
    getGrantUpdates([grant.id], nineMonthsAgo),
  ])

  return (
    <div className="flex w-full items-center justify-center">
      <div className="max-lg:w-full max-lg:max-w-full">
        <h3 className="font-bold tracking-tight">Impact</h3>
        <p className="mb-6 mt-0.5 text-sm tracking-tight text-muted-foreground">
          {updates.count} {pluralize("update", updates.count)} and {storiesCount}{" "}
          {pluralize("story", storiesCount)} published
        </p>

        <ActivityCalendar
          data={activities}
          updates={structuredClone(updates.byDate)}
          maxLevel={MAX_LEVEL}
          weekStart={1}
          blockSize={20}
          blockMargin={4}
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
      </div>
    </div>
  )
}
