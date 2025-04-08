import "server-only"

import { MinimalCast } from "@/lib/types/cast"
import { getCacheStrategy } from "../edge"
import { farcasterDb } from "../farcaster-edge"

export async function getGrantFeedbackCasts(grantId: string): Promise<MinimalCast[]> {
  try {
    const root_parent_url = `https://flows.wtf/item/${grantId}`

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
      where: { deleted_at: null, parent_hash: null, root_parent_url },
      orderBy: { created_at: "desc" },
      take: 32,
      ...getCacheStrategy(180),
    })
  } catch (error) {
    console.error("Error fetching grant feedback casts:", error)
    return []
  }
}
