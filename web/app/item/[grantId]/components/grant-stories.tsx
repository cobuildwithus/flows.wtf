import "server-only"

import { StoryCard } from "@/app/components/story-card"
import { FeaturedStoryCard } from "@/app/components/story-card-featured"
import database, { getCacheStrategy } from "@/lib/database/edge"

interface Props {
  grantId: string
  className?: string
  canEdit: boolean
}

export async function GrantStories(props: Props) {
  const { grantId, className = "", canEdit } = props

  const stories = await database.story.findMany({
    where: { grant_ids: { has: grantId } },
    orderBy: { updated_at: "desc" },
    take: 11,
    ...getCacheStrategy(180),
  })

  if (stories.length === 0) return null

  const inProgress = stories.filter((story) => !story.complete)
  const completed = stories.filter((story) => story.complete)

  const [featuredStory, ...remaining] = completed

  return (
    <div className={className}>
      <h3 className="text-xl font-medium lg:text-2xl">Stories</h3>
      <div className="mt-6 grid grid-cols-1 gap-2.5 md:grid-cols-4">
        {featuredStory && <FeaturedStoryCard story={featuredStory} />}
        {remaining.map((story) => (
          <StoryCard story={story} key={story.id} />
        ))}
      </div>

      {canEdit && inProgress.length > 0 && (
        <>
          <h3 className="mt-10 text-xl font-medium lg:text-2xl">In Progress</h3>
          <div className="mt-6 grid grid-cols-1 gap-2.5 md:grid-cols-4">
            {inProgress.map((story) => (
              <StoryCard story={story} key={story.id} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
