import "server-only"

import { ActivityCalendar } from "@/components/ui/activity-calendar"
import { Grant } from "@prisma/flows"
import { unstable_cache } from "next/cache"
import { getActivity, getGrantUpdates } from "@/lib/database/queries/grant"

interface Props {
  grant: Pick<Grant, "id" | "recipient">
}

const MAX_LEVEL = 3

export async function GrantActivity(props: Props) {
  const { grant } = props

  const oneYearAgo = new Date(new Date().setFullYear(new Date().getFullYear() - 1))
  const [{ activities, storiesCount }, updates] = await Promise.all([
    unstable_cache(() => getActivity([grant], oneYearAgo), [`activity-graph-${grant.id}`], {
      revalidate: 180,
    })(),
    getGrantUpdates([grant.id], oneYearAgo),
  ])

  return (
    <div>
      <h3 className="font-bold tracking-tight">Impact</h3>
      <p className="mb-6 mt-0.5 text-sm tracking-tight text-muted-foreground">
        {updates.count} updates and {storiesCount} stories published
      </p>

      <ActivityCalendar
        data={activities}
        updates={structuredClone(updates.byDate)}
        maxLevel={MAX_LEVEL}
        weekStart={1}
        blockSize={15}
        blockMargin={4}
        labels={{ legend: { less: "Less", more: "More" } }}
        hideTotalCount
        theme={{
          light: [
            "hsl(var(--secondary))",
            "hsl(var(--primary) / 0.3)",
            "hsl(var(--primary) / 0.75)",
            "hsl(var(--primary))",
          ],
          dark: [
            "hsl(var(--secondary) / 0.3)",
            "hsl(var(--secondary))",
            "hsl(var(--primary) / 0.75)",
            "hsl(var(--primary))",
          ],
        }}
      />
    </div>
  )
}
