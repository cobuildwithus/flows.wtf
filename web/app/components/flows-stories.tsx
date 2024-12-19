import "server-only"

import { StoryCard } from "@/app/components/story-card"
import { getUser } from "@/lib/auth/user"
import database, { getCacheStrategy } from "@/lib/database/edge"
import { ActionCard } from "./action-card/action-card"
import { FeaturedStoryCard } from "./story-card-featured"

export async function FlowsStories() {
  const stories = await database.story.findMany({
    where: { complete: true },
    orderBy: { created_at: "desc" },
    take: 6,
    ...getCacheStrategy(600),
  })

  if (stories.length === 0) return null

  const [featuredStory, ...remainingStories] = stories

  return (
    <div className="mt-10 grid grid-cols-1 gap-2.5 md:grid-cols-3 lg:grid-cols-4">
      <div className="relative isolate overflow-hidden rounded-2xl bg-gradient-to-b from-secondary to-secondary/80 p-5 pb-6">
        <ActionCard user={await getUser()} />
      </div>
      {featuredStory && <FeaturedStoryCard story={featuredStory} />}
      {remainingStories.map((story) => (
        <StoryCard story={story} key={story.id} />
      ))}
    </div>
  )
}
