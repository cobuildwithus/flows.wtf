"use server"

import { getFarcasterUsersByFids } from "@/lib/farcaster/get-user"
import { farcasterDb } from "../farcaster-db"
import type { Cast, Profile } from "@prisma/farcaster"

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

interface CastRow {
  timestamp: Date
  computed_tags: string[] | null
}

async function getActivityFromCasts(flowIds: string[], startDate: Date) {
  const casts = await farcasterDb.$queryRaw<CastRow[]>`
    SELECT "timestamp", computed_tags
    FROM production.farcaster_casts
    WHERE deleted_at IS NULL
      AND computed_tags IS NOT NULL
      AND array_length(computed_tags, 1) > 0
      AND computed_tags && ${flowIds}::text[]
      AND created_at > ${startDate}
      AND parent_hash IS NULL
    ORDER BY created_at ASC
  `

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

type CastUpdateRow = Pick<
  Cast,
  | "hash"
  | "text"
  | "created_at"
  | "embeds_array"
  | "computed_tags"
  | "fid"
  | "mentioned_fids"
  | "impact_verifications"
  | "mentions_positions_array"
>

export async function getStartupUpdates(flowIds: string[], startDate: Date) {
  const allCasts = await farcasterDb.$queryRaw<CastUpdateRow[]>`
    SELECT hash, text, created_at, embeds_array, computed_tags, fid, mentioned_fids, impact_verifications, mentions_positions_array
    FROM production.farcaster_casts
    WHERE deleted_at IS NULL
      AND computed_tags IS NOT NULL
      AND array_length(computed_tags, 1) > 0
      AND computed_tags && ${flowIds}::text[]
      AND parent_hash IS NULL
      AND created_at > ${startDate}
    ORDER BY created_at DESC
  `

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
