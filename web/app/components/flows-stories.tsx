import "server-only"

import { StoryCard } from "@/app/components/story-card"
import database from "@/lib/database/edge"
import { FeaturedStoryCard } from "./story-card-featured"
import { ImpactDialog } from "@/app/item/[grantId]/components/impact-dialog"
import { BuilderSection } from "./builder-section"
import { User } from "@/lib/auth/user"

interface Props {
  user?: User
}

export async function FlowsStories({ user }: Props) {
  const [stories, grants] = await getStoriesAndGrants(user?.address)

  const hasGrant = grants.length > 0

  if (stories.length === 0) return null

  const [featuredStory, ...remainingStories] = stories

  const storiesToRender = !hasGrant ? remainingStories.slice(0, -1) : remainingStories

  return (
    <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
      <BuilderSection grants={grants} />

      {hasGrant && <ImpactDialog grants={grants} dialogTitle="Your Impact" user={user} />}

      {featuredStory && <FeaturedStoryCard story={featuredStory} />}

      {storiesToRender.map((story) => (
        <StoryCard story={story} key={story.id} />
      ))}
    </div>
  )
}

function getStoriesAndGrants(recipient?: `0x${string}`) {
  return Promise.all([
    database.story.findMany({
      where: { complete: true, header_image: { not: null } },
      orderBy: { created_at: "desc" },
      take: 7,
    }),
    recipient
      ? database.grant.findMany({
          where: { isActive: true, isTopLevel: false, recipient },
          include: { derivedData: true },
        })
      : Promise.resolve([]),
  ])
}
