"use server"

import { getFarcasterUsersByFids } from "@/lib/farcaster/get-user"
import { farcasterDb } from "../farcaster-db"
import type { Profile } from "@prisma/farcaster"

const MAX_LEVEL = 3

export async function getStartupActivity(flowIds: string[], startDate: Date) {
  const casts = await getActivityFromCasts(flowIds, startDate)

  const data = new Map<string, { count: number; level: number; date: string }>()

  data.set(getDate(startDate), { date: getDate(startDate), count: 0, level: 0 }) // start date
  data.set(getDate(new Date()), { date: getDate(new Date()), count: 0, level: 0 }) // end date - today

  for (const activity of casts) {
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
  }

  return Array.from(data.values()).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  )
}

async function getActivityFromCasts(flowIds: string[], startDate: Date) {
  const casts = await farcasterDb.cast.findMany({
    select: { timestamp: true, computed_tags: true },
    where: {
      deleted_at: null,
      computed_tags: { hasSome: flowIds },
      created_at: { gt: startDate },
      parent_hash: null,
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
      if (cast.computed_tags?.some((tag) => flowIds.includes(tag))) {
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

function getDate(date: Date) {
  return date.toISOString().split("T")[0]
}

export async function getStartupUpdates(flowIds: string[], startDate: Date) {
  const allCasts = await farcasterDb.cast.findMany({
    where: {
      deleted_at: null,
      computed_tags: { hasSome: flowIds },
      parent_hash: null,
      created_at: { gt: startDate },
    },
    orderBy: { created_at: "desc" },
    select: {
      hash: true,
      text: true,
      created_at: true,
      embeds_array: true,
      computed_tags: true,
      fid: true,
      mentioned_fids: true,
      impact_verifications: true,
      mentions_positions_array: true,
    },
  })

  const profiles = await getFarcasterUsersByFids(allCasts.map((cast) => cast.fid))

  const profilesByFid = new Map(profiles.map((profile) => [profile?.fid, profile]))

  const castsWithProfiles = allCasts.map((cast) => ({
    ...cast,
    profile: profilesByFid.get(cast.fid) as Profile,
  }))

  const updates = castsWithProfiles.filter((cast) =>
    cast.computed_tags?.some((tag) => flowIds.includes(tag)),
  )

  return {
    count: updates.length,
    byDate: castsWithProfiles.reduce<Record<string, (typeof updates)[number][]>>((acc, update) => {
      const dateKey = getDate(update.created_at)
      if (!acc[dateKey]) acc[dateKey] = []
      acc[dateKey].push(update)
      return acc
    }, {}),
  }
}
