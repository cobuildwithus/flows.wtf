import type { Cast, Profile } from "@prisma/farcaster"

export type MinimalCast = Pick<
  Cast,
  | "created_at"
  | "embeds"
  | "hash"
  | "id"
  | "impact_verifications"
  | "mentioned_fids"
  | "mentions_positions_array"
  | "text"
> & {
  profile: Pick<Profile, "fname" | "avatar_url" | "display_name">
}
