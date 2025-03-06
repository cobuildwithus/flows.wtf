"use server"

import { getCacheStrategy } from "../edge"
import { farcasterDb } from "../farcaster-edge"

export const getCastsByIds = async (castIds: number[]) => {
  if (castIds.length === 0) return []

  return await farcasterDb.cast.findMany({
    where: {
      id: {
        in: castIds,
      },
      deleted_at: null,
    },
    include: {
      profile: true,
    },
    orderBy: {
      timestamp: "desc",
    },
    ...getCacheStrategy(3600), // 1 hour in seconds
  })
}
