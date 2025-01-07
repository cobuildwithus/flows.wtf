"use server"

import { getFarcasterUsersByFids } from "@/lib/farcaster/get-user"
import { insertMentionsIntoText } from "./cast-mentions"

interface GetCastsMentionsProps {
  text: string
  mentionsPositions: number[]
  mentionedFids: bigint[]
}

export async function getCastsMentions({
  text,
  mentionsPositions,
  mentionedFids,
}: GetCastsMentionsProps) {
  if (mentionedFids.length === 0) return text

  const mentionedUsers = await getFarcasterUsersByFids(mentionedFids)
  if (!mentionedUsers) return text

  const fidToFname = new Map(mentionedUsers.map((user) => [user.fid.toString(), user.fname || ""]))

  return insertMentionsIntoText(text, mentionsPositions, mentionedFids.map(Number), fidToFname)
}
