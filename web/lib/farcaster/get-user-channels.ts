import "server-only"

import { cache } from "react"
import { farcasterDb } from "../database/farcaster-edge"
import { getCacheStrategy } from "../database/edge"

export const getFarcasterUserChannels = cache(async (fid: number) => {
  try {
    const channelMembers = await farcasterDb.channelMember.findMany({
      where: {
        fid: BigInt(fid),
        deleted_at: null,
      },
      orderBy: {
        timestamp: "desc",
      },
      take: 100,
      ...getCacheStrategy(86400),
    })

    return channelMembers.map((member) => ({
      channelId: member.channel_id,
      timestamp: member.timestamp,
    }))
  } catch (e: any) {
    console.error(e?.message)
    return []
  }
})
