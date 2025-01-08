import "server-only"

import { StoryCard } from "@/app/components/story-card"
import { getUser, hasSession } from "@/lib/auth/user"
import database, { getCacheStrategy } from "@/lib/database/edge"
import { ActionCard } from "./action-card/action-card"
import { FeaturedStoryCard } from "./story-card-featured"
import { ImpactDialog } from "@/app/item/[grantId]/components/impact-dialog"
import { HomepageActivity } from "./homepage-activity"
import { cn } from "@/lib/utils"

export async function FlowsStories({ recipient }: { recipient?: `0x${string}` }) {
  const [stories, grants] = await Promise.all([
    database.story.findMany({
      where: { complete: true },
      orderBy: { created_at: "desc" },
      take: 7,
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

  const storiesToRender = !hasGrant ? remainingStories.slice(0, -1) : remainingStories

  return (
    <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
      <div
        className={cn(
          "grid grid-cols-1 gap-2 rounded-2xl bg-gradient-to-b from-secondary to-secondary/80",
          hasGrant ? "md:col-span-3 md:grid-cols-3" : "md:col-span-1 md:grid-cols-1",
        )}
      >
        <div
          className={cn(
            "relative isolate overflow-hidden p-5 pb-6",
            !hasGrant && "md:mx-auto md:w-full md:max-w-lg",
          )}
        >
          <ActionCard user={await getUser()} hasSession={await hasSession()} />
        </div>
        {hasGrant && (
          <div className="md:col-span-2">
            <HomepageActivity grants={grants} />
          </div>
        )}
      </div>

      {hasGrant && <ImpactDialog grants={grants} dialogTitle="Your Impact" />}

      {featuredStory && <FeaturedStoryCard story={featuredStory} />}

      {storiesToRender.map((story) => (
        <StoryCard story={story} key={story.id} />
      ))}
    </div>
  )
}
