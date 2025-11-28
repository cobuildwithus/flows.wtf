"use server"

import { getFarcasterUserByEthAddress } from "@/lib/farcaster/get-user"
import type { Grant } from "@prisma/flows"
import { farcasterDb } from "../farcaster-db"
import type { Profile } from "@prisma/farcaster"
import { Prisma } from "@prisma/farcaster"

const MAX_LEVEL = 3

interface CastRow {
  timestamp: Date
  computed_tags: string[] | null
}

export async function getActivity(
  recipient: string,
  grants: Pick<Grant, "id" | "recipient">[],
  startDate: Date,
) {
  const casts = await getActivityFromCasts(
    recipient,
    grants.map((grant) => grant.id),
    startDate,
  )

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

async function getActivityFromCasts(recipient: string, grantIds: string[], startDate: Date) {
  const user = await getFarcasterUserByEthAddress(recipient as `0x${string}`)

  // Use UNION to hit the partial index on computed_tags while also including fid-based casts
  const casts = user?.fid
    ? await farcasterDb.$queryRaw<CastRow[]>`
        SELECT "timestamp", computed_tags FROM (
          SELECT "timestamp", computed_tags
          FROM production.farcaster_casts
          WHERE deleted_at IS NULL
            AND computed_tags IS NOT NULL
            AND array_length(computed_tags, 1) > 0
            AND computed_tags && ${grantIds}::text[]
            AND created_at > ${startDate}
            AND parent_hash IS NULL
          UNION
          SELECT "timestamp", computed_tags
          FROM production.farcaster_casts
          WHERE deleted_at IS NULL
            AND fid = ${user.fid}
            AND created_at > ${startDate}
            AND parent_hash IS NULL
        ) AS combined
        ORDER BY "timestamp" ASC
      `
    : await farcasterDb.$queryRaw<CastRow[]>`
        SELECT "timestamp", computed_tags
        FROM production.farcaster_casts
        WHERE deleted_at IS NULL
          AND computed_tags IS NOT NULL
          AND array_length(computed_tags, 1) > 0
          AND computed_tags && ${grantIds}::text[]
          AND created_at > ${startDate}
          AND parent_hash IS NULL
        ORDER BY "timestamp" ASC
      `

  const activityByDate = casts.reduce<Record<string, { count: number; aboutGrant: number }>>(
    (acc, cast) => {
      const date = getDate(cast.timestamp)

      if (!acc[date]) {
        acc[date] = { count: 0, aboutGrant: 0 }
      }

      acc[date].count++
      if (cast.computed_tags?.some((tag) => grantIds.includes(tag))) {
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

export async function getGrantUpdates(grants: Pick<Grant, "id" | "recipient">[], startDate: Date) {
  const uniqueRecipients = [...new Set(grants.map((grant) => grant.recipient))]
  const profiles = await Promise.all(
    uniqueRecipients.map(async (recipient) =>
      getFarcasterUserByEthAddress(recipient as `0x${string}`),
    ),
  )

  const grantIds = grants.map((grant) => grant.id)
  const fids = profiles.map((profile) => profile?.fid).filter((fid) => fid !== undefined)

  const allCasts = await farcasterDb.cast.findMany({
    where: {
      deleted_at: null,
      fid: { in: fids },
      parent_hash: null,
      created_at: { gt: startDate },
    },
    orderBy: { created_at: "desc" },
    select: {
      hash: true,
      text: true,
      embeds_array: true,
      created_at: true,
      computed_tags: true,
      fid: true,
      mentioned_fids: true,
      impact_verifications: true,
      mentions_positions_array: true,
    },
  })

  const profilesByFid = new Map(profiles.map((profile) => [profile?.fid, profile]))

  const castsWithProfiles = allCasts.map((cast) => ({
    ...cast,
    profile: profilesByFid.get(cast.fid) as Profile,
  }))

  const updates = castsWithProfiles.filter((cast) =>
    cast.computed_tags?.some((tag) => grantIds.includes(tag)),
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
