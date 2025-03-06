"use server"

import { getFarcasterUserByEthAddress } from "@/lib/farcaster/get-user"
import type { Grant } from "@prisma/flows"
import { farcasterDb } from "../farcaster-edge"
import { getCacheStrategy } from "../edge"
import type { Profile } from "@prisma/farcaster"

const MAX_LEVEL = 3

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

  const casts = await farcasterDb.cast.findMany({
    select: { timestamp: true, computed_tags: true },
    where: {
      deleted_at: null,
      OR: [{ computed_tags: { hasSome: grantIds } }, { fid: user?.fid }],
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
      id: true,
      created_at: true,
      embeds: true,
      computed_tags: true,
      fid: true,
      mentioned_fids: true,
      impact_verifications: true,
      mentions_positions_array: true,
    },
    ...getCacheStrategy(180),
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
