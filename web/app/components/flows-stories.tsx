import "server-only"

import { StoryCard } from "@/app/components/story-card"
import { getUser, hasSession } from "@/lib/auth/user"
import database, { getCacheStrategy } from "@/lib/database/edge"
import { ActionCard } from "./action-card/action-card"
import { FeaturedStoryCard } from "./story-card-featured"
import { ImpactDialog } from "@/app/item/[grantId]/components/impact-dialog"

export async function FlowsStories({ recipient }: { recipient?: `0x${string}` }) {
  const [stories, grants] = await Promise.all([
    database.story.findMany({
      where: { complete: true },
      orderBy: { created_at: "desc" },
      take: 6,
      ...getCacheStrategy(600),
    }),
    recipient
      ? database.grant.findMany({
          where: { isActive: true, isTopLevel: false, recipient },
          include: { derivedData: true },
          ...getCacheStrategy(600),
        })
      : Promise.resolve([]),
  ])

  const hasGrant = grants.length > 0

  if (stories.length === 0) return null

  const [featuredStory, ...remainingStories] = stories

  const storiesToRender = hasGrant ? remainingStories.slice(0, -1) : remainingStories

  return (
    <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
      <div className="relative isolate overflow-hidden rounded-2xl bg-gradient-to-b from-secondary to-secondary/80 p-5 pb-6">
        <ActionCard user={await getUser()} hasSession={await hasSession()} />
      </div>
      {featuredStory && <FeaturedStoryCard story={featuredStory} />}
      {hasGrant && <ImpactDialog grants={grants} dialogTitle="Your Impact" />}

      {storiesToRender.map((story) => (
        <StoryCard story={story} key={story.id} />
      ))}
    </div>
  )
}
