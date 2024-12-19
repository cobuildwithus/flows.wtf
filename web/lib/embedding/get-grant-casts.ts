"use server"

import { farcasterDb } from "@/lib/database/farcaster-edge"
import { getCacheStrategy } from "../database/edge"
import { insertMentionsIntoText } from "../casts/cast-mentions"
import { getFarcasterUsersByFids } from "../farcaster/get-user"

export async function getGrantCasts({ grantId }: { grantId: string }) {
  try {
    const casts = await getCastsFromDb(grantId)
    const castsWithMentions = await Promise.all(casts.map(processCastMentions))

    return castsWithMentions
  } catch (error) {
    console.error("Error in getGrantCasts:", error)
    throw new Error((error as Error).message || "Failed to get grant casts")
  }
}

async function getCastsFromDb(grantId: string) {
  try {
    return await farcasterDb.cast.findMany({
      where: {
        computed_tags: {
          has: grantId,
        },
        parent_hash: null,
        deleted_at: null,
      },
      include: {
        profile: true,
      },
      orderBy: {
        created_at: "desc",
      },
      take: 50,
      ...getCacheStrategy(600),
    })
  } catch (error) {
    console.error("Error fetching casts from DB:", error)
    return []
  }
}

type CastWithMentions = Awaited<ReturnType<typeof getCastsFromDb>>[number]

async function processCastMentions(cast: CastWithMentions) {
  try {
    const mentions = cast.mentioned_fids
    if (!mentions.length) return cast

    const mentionedUsers = await getFarcasterUsersByFids(mentions)
    const fidToFname = new Map(
      mentionedUsers.map((user) => [user.fid.toString(), user.fname || ""]),
    )

    const positions = cast.mentions_positions_array

    const text = insertMentionsIntoText(
      cast.text || "",
      positions,
      mentions.map(Number),
      fidToFname,
    )

    return {
      ...cast,
      text,
    }
  } catch (e) {
    console.error("Error processing mentions for cast:", e)
    return cast
  }
}
