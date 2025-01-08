import "server-only"

import { getUser } from "@/lib/auth/user"
import database, { getCacheStrategy } from "@/lib/database/edge"
import { Status } from "@/lib/enums"
import { Grant } from "@prisma/flows"
import { getFarcasterUserByEthAddress } from "@/lib/farcaster/get-user"
import { farcasterDb } from "../farcaster-edge"

export async function countUserActiveGrants() {
  const user = await getUser()
  if (!user) return 0

  return database.grant.count({
    where: {
      recipient: user.address,
      isFlow: false,
      status: { in: [Status.ClearingRequested, Status.Registered, Status.RegistrationRequested] },
    },
    ...getCacheStrategy(360),
  })
}

const MAX_LEVEL = 3

export async function getActivity(grants: Pick<Grant, "id" | "recipient">[], startDate: Date) {
  const [casts, stories] = await Promise.all([
    Promise.all(grants.map((grant) => getActivityFromCasts(grant.recipient, grant.id, startDate))),
    Promise.all(grants.map((grant) => getActivityFromStories(grant.id, startDate))),
  ])

  const data = new Map<string, { count: number; level: number; date: string }>()

  data.set(getDate(startDate), { date: getDate(startDate), count: 0, level: 0 }) // start date
  data.set(getDate(new Date()), { date: getDate(new Date()), count: 0, level: 0 }) // end date - today

  const allActivities = [...casts.flat(), ...stories.flat()]
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
    storiesCount: stories.flat().length,
  }
}

async function getActivityFromCasts(recipient: string, grantId: string, startDate: Date) {
  const user = await getFarcasterUserByEthAddress(recipient as `0x${string}`)

  const casts = await farcasterDb.cast.findMany({
    select: { timestamp: true, computed_tags: true },
    where: {
      parent_hash: null,
      deleted_at: null,
      OR: [{ computed_tags: { has: grantId } }, { fid: user?.fid }],
      created_at: { gt: startDate },
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

async function getActivityFromStories(grantId: string, startDate: Date) {
  const stories = await database.story.findMany({
    where: {
      grant_ids: { has: grantId },
      complete: true,
      created_at: { gt: startDate },
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

export async function getGrantUpdates(grantIds: string | string[], startDate: Date) {
  const ids = Array.isArray(grantIds) ? grantIds : [grantIds]

  const updates = await farcasterDb.cast.findMany({
    where: {
      parent_hash: null,
      deleted_at: null,
      computed_tags: { hasSome: ids },
      created_at: { gt: startDate },
    },
    orderBy: { created_at: "desc" },
    select: {
      hash: true,
      text: true,
      created_at: true,
      embeds: true,
      profile: {
        select: {
          fname: true,
          avatar_url: true,
          display_name: true,
        },
      },
      mentioned_fids: true,
      mentions_positions_array: true,
    },
    ...getCacheStrategy(180),
  })

  return {
    count: updates.length,
    byDate: updates.reduce<Record<string, (typeof updates)[number][]>>((acc, update) => {
      const dateKey = getDate(update.created_at)
      if (!acc[dateKey]) acc[dateKey] = []
      acc[dateKey].push(update)
      return acc
    }, {}),
  }
}
