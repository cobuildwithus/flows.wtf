import "server-only"

import { cache } from "react"
import { farcasterDb } from "../database/farcaster-edge"
import { getCacheStrategy } from "../database/edge"

export const getAllChannelMembers = cache(async (channelId: string) => {
  try {
    const channelMembers = await farcasterDb.channelMember.findMany({
      where: {
        channel_id: channelId,
        deleted_at: null,
      },
      include: {
        profile: {
          select: {
            fid: true,
            fname: true,
            display_name: true,
          },
        },
      },
      orderBy: {
        timestamp: "desc",
      },
      ...getCacheStrategy(86400),
    })

    return channelMembers.map((member) => ({
      fid: Number(member.fid),
      fname: member.profile.fname,
      channelId: member.channel_id,
      timestamp: member.timestamp,
    }))
  } catch (e: any) {
    console.error(e?.message)
    return []
  }
})

// get all nounish citizens (in /nouns /yellow /vrbs /flows /gnars)
const nounishChannels = ["nouns", "yellow", "vrbs", "flows", "gnars"]
export const getAllNounishCitizens = cache(async () => {
  const members = await Promise.all(nounishChannels.map((channel) => getAllChannelMembers(channel)))
  const flattened = members.flat()

  // Remove duplicates by fid since a user can be in multiple channels
  const uniqueMembers = Array.from(
    new Map(flattened.map((member) => [member.fid, member])).values(),
  )

  return uniqueMembers
})
