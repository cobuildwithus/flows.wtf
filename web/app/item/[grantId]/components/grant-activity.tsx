import "server-only"

import { ActivityCalendar } from "@/components/ui/activity-calendar"
import database from "@/lib/database/edge"
import { farcasterDb } from "@/lib/database/farcaster-edge"
import { getFarcasterUserByEthAddress } from "@/lib/farcaster/get-user"
import { Grant } from "@prisma/flows"
import { unstable_cache } from "next/cache"

interface Props {
  grant: Pick<Grant, "id" | "recipient">
}

const MAX_LEVEL = 3

export async function GrantActivity(props: Props) {
  const { grant } = props

  const { activities, castsCount, storiesCount } = await unstable_cache(
    () => getActivity(grant),
    [`activity-graph-${grant.id}`],
    { revalidate: 1 },
  )()

  return (
    <div>
      <h3 className="font-bold tracking-tight">Grant Impact</h3>
      <p className="mb-6 text-muted-foreground max-sm:text-sm">
        {castsCount} updates and {storiesCount} stories published
      </p>
      <ActivityCalendar
        data={activities}
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
            "hsl(var(--primary) / 0.6)",
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

async function getActivity(grant: Pick<Grant, "id" | "recipient">) {
  const [casts, stories] = await Promise.all([
    getActivityFromCasts(grant.recipient, grant.id),
    getActivityFromStories(grant.id),
  ])

  const data = new Map<string, { count: number; level: number; date: string }>()

  const startDate = new Date(new Date().setFullYear(new Date().getFullYear() - 1))
  data.set(getDate(startDate), { date: getDate(startDate), count: 0, level: 0 })

  const allActivities = [...casts, ...stories]
  allActivities.forEach((activity) => {
    const existingActivity = data.get(activity.date)

    if (existingActivity) {
      data.set(activity.date, {
        date: activity.date,
        count: existingActivity.count + activity.count,
        level: Math.min(existingActivity.level + activity.level, MAX_LEVEL),
      })
    } else {
      data.set(activity.date, activity)
    }
  })

  return {
    activities: Array.from(data.values()).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    ),
    castsCount: casts.filter((c) => c.level > 1).length,
    storiesCount: stories.length,
  }
}

async function getActivityFromCasts(recipient: string, grantId: string) {
  const user = await getFarcasterUserByEthAddress(recipient as `0x${string}`)

  const casts = await farcasterDb.cast.findMany({
    select: { timestamp: true, computed_tags: true },
    where: {
      parent_hash: null,
      deleted_at: null,
      OR: [{ computed_tags: { has: grantId } }, { fid: user?.fid }],
      created_at: { gt: new Date(new Date().setFullYear(new Date().getFullYear() - 1)) },
    },
    orderBy: { created_at: "asc" },
  })

  const activityByDate = casts.reduce<Record<string, { count: number; aboutGrant: number }>>(
    (acc, cast) => {
      const date = getDate(cast.timestamp)

      if (!acc[date]) {
        acc[date] = { count: 0, aboutGrant: 0 }
      }

      acc[date].count++
      if (cast.computed_tags?.includes(grantId)) {
        acc[date].aboutGrant++
      }

      return acc
    },
    {},
  )

  return Object.entries(activityByDate).map(([date, { count, aboutGrant }]) => ({
    date,
    count,
    level: count > 0 ? (aboutGrant >= 2 ? 3 : aboutGrant > 0 ? 2 : 1) : 0,
  }))
}

async function getActivityFromStories(grantId: string) {
  const stories = await database.story.findMany({
    where: {
      grant_ids: { has: grantId },
      complete: true,
      created_at: { gt: new Date(new Date().setFullYear(new Date().getFullYear() - 1)) },
    },
    select: { id: true, created_at: true },
    orderBy: { created_at: "asc" },
  })

  const activityByDate = stories.reduce<Record<string, { count: number }>>((acc, story) => {
    const date = getDate(story.created_at)
    if (!acc[date]) acc[date] = { count: 0 }
    acc[date].count++
    return acc
  }, {})

  return Object.entries(activityByDate).map(([date, { count }]) => ({ date, count, level: 3 }))
}

function getDate(date: Date) {
  return date.toISOString().split("T")[0]
}
