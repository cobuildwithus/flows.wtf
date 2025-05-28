"use server"

import { MinimalCast } from "@/lib/types/cast"
import { farcasterDb } from "../farcaster"

async function fetchFeedbackCasts(url: string): Promise<MinimalCast[]> {
  try {
    return await farcasterDb.cast.findMany({
      select: {
        created_at: true,
        embeds: true,
        hash: true,
        id: true,
        impact_verifications: true,
        mentioned_fids: true,
        mentions_positions_array: true,
        text: true,
        profile: { select: { fname: true, avatar_url: true, display_name: true } },
      },
      where: { deleted_at: null, parent_hash: null, root_parent_url: url },
      orderBy: { created_at: "desc" },
      take: 32,
    })
  } catch (error) {
    console.error("Error fetching feedback casts:", error)
    return []
  }
}

export async function getGrantFeedbackCasts(grantId: string): Promise<MinimalCast[]> {
  return fetchFeedbackCasts(`https://flows.wtf/item/${grantId}`)
}

export async function getGrantFeedbackCastsForFlow(grantId: string): Promise<MinimalCast[]> {
  return fetchFeedbackCasts(`https://flows.wtf/flow/${grantId}/about`)
}
