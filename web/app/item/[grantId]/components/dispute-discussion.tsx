import "server-only"

import { Button } from "@/components/ui/button"
import {
  getGrantFeedbackCasts,
  getGrantFeedbackCastsForFlow,
} from "@/lib/database/queries/get-grant-feedback"
import type { Grant } from "@prisma/flows"

export async function DisputeDiscussionLink({ grant }: { grant: Pick<Grant, "id" | "isFlow"> }) {
  const discussionPosts = grant.isFlow
    ? await getGrantFeedbackCastsForFlow(grant.id)
    : await getGrantFeedbackCasts(grant.id)

  const latestDiscussionPost = discussionPosts
    ?.filter((post) => post.profile.fname === "flowit")
    .sort((a, b) => b.created_at.getTime() - a.created_at.getTime())[0]

  if (!latestDiscussionPost) {
    return null
  }

  return (
    <Button variant="secondary" size="md" className="flex items-center gap-1" asChild>
      <a
        href={`https://warpcast.com/${latestDiscussionPost.profile.fname}/0x${Buffer.from(new Uint8Array(latestDiscussionPost.hash)).toString("hex")}`}
        target="_blank"
        rel="noreferrer"
      >
        View discussion
      </a>
    </Button>
  )
}
