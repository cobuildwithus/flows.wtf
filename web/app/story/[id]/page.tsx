import "server-only"

import { AgentChatProvider } from "@/app/chat/components/agent-chat"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { DateTime } from "@/components/ui/date-time"
import { Markdown } from "@/components/ui/markdown"
import { VideoPlayer } from "@/components/ui/video-player"
import { UserProfile } from "@/components/user-profile/user-profile"
import { getPrivyIdToken } from "@/lib/auth/get-user-from-cookie"
import { getUser } from "@/lib/auth/user"
import database from "@/lib/database/flows-db"
import { canEditStory } from "@/lib/database/helpers"
import { getIpfsUrl } from "@/lib/utils"
import { CalendarIcon } from "lucide-react"
import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import pluralize from "pluralize"
import { cache } from "react"
import { KeyPoints } from "./components/key-points"
import { Participants } from "./components/participants"
import { Sources } from "./components/sources"
import { StoryChat } from "./components/story-chat"
import { StoryIncomplete } from "./components/story-incomplete"

interface Props {
  params: Promise<{ id: string }>
}

const getStory = cache(async (id: string) => {
  const story = await database.story.findUniqueOrThrow({
    where: { id },
  })

  const [grants, flows] = await Promise.all([
    database.grant.findMany({
      where: { id: { in: story.grant_ids } },
      omit: { description: true },
    }),
    database.grant.findMany({
      where: { id: { in: story.parent_flow_ids } },
      omit: { description: true },
    }),
  ])

  return { ...story, grants, flows }
})

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { id } = await props.params

  const story = await getStory(id)

  return {
    title: story.title,
    description: story.tagline,
    ...(story.header_image ? { openGraph: { images: [story.header_image] } } : {}),
  }
}

export default async function Page(props: Props) {
  const { id } = await props.params

  const [story, user] = await Promise.all([getStory(id), getUser()])

  const { title, grants, flows, key_points, updated_at, timeline, sources, author } = story

  return (
    <AgentChatProvider
      id={`story-${id}-${user?.address}`}
      type="gonzo"
      user={user}
      data={{ storyId: id }}
      identityToken={await getPrivyIdToken()}
    >
      <article className="container mt-2.5 max-w-6xl pb-24 md:mt-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Flows</BreadcrumbLink>
            </BreadcrumbItem>

            <BreadcrumbSeparator />

            <BreadcrumbItem>
              <BreadcrumbLink href={`/flow/${flows[0].id}`}>{flows[0].title}</BreadcrumbLink>
            </BreadcrumbItem>

            <BreadcrumbSeparator className="max-sm:hidden" />

            <BreadcrumbItem className="max-sm:hidden">
              <BreadcrumbPage>{title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <header className="mt-8 max-w-2xl">
          <h1 className="text-pretty text-2xl font-bold tracking-tight md:text-4xl">{title}</h1>
          <p className="mt-2 text-pretty text-lg text-muted-foreground md:text-xl">
            {story.tagline}
          </p>
          {!story.complete && <StoryIncomplete canEdit={canEditStory(story, user?.address)} />}
        </header>

        <div className="mt-8 grid grid-cols-1 gap-x-12 gap-y-8 md:grid-cols-12">
          <div className="md:col-span-8">
            <section className="flex items-center justify-between">
              {author && (
                <UserProfile address={author as `0x${string}`} withPopover={false}>
                  {(profile) => (
                    <div className="flex items-center space-x-3">
                      <Avatar className="size-10 bg-primary">
                        <AvatarImage src={profile.pfp_url} alt={profile.display_name} />
                      </Avatar>
                      <div className="flex flex-col items-start justify-center">
                        <Link
                          target="_blank"
                          href={`https://farcaster.xyz/${profile.username}`}
                          className="text-sm font-medium"
                        >
                          {profile.display_name}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          {Math.ceil(story.summary.split(" ").length / 200)} min read
                        </p>
                      </div>
                    </div>
                  )}
                </UserProfile>
              )}
              <div className="flex items-center text-xs leading-none text-muted-foreground md:text-sm">
                <CalendarIcon className="mr-2 size-3" />
                <DateTime date={updated_at} relative short />
              </div>
            </section>

            <Carousel className="mt-4 w-full">
              <CarouselContent>
                {story.media_urls.map((url) => (
                  <CarouselItem key={url}>
                    <div className="relative aspect-video">
                      {url.endsWith(".m3u8") ? (
                        <VideoPlayer
                          url={url}
                          controls
                          className="overflow-hidden rounded-lg"
                          width="100%"
                          height="100%"
                        />
                      ) : (
                        <Image
                          src={getIpfsUrl(url, "pinata")}
                          alt=""
                          fill
                          className="rounded-lg object-contain"
                        />
                      )}
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              {story.media_urls.length > 1 && (
                <div className="mt-2.5 flex items-center justify-end space-x-1.5">
                  <CarouselPrevious className="static translate-y-0" />
                  <CarouselNext className="static translate-y-0" />
                </div>
              )}
            </Carousel>

            <KeyPoints key_points={key_points} className="mb-12 mt-4 md:hidden" />

            <div className="my-8 space-y-5 text-pretty text-sm md:text-base [&>p]:text-foreground/75">
              <Markdown>{story.summary}</Markdown>
              <Sources sources={sources} />
            </div>
          </div>

          <aside className="space-y-8 md:col-span-4">
            <div>
              <h2 className="mb-4 text-sm font-medium text-muted-foreground">
                {pluralize("Grant", grants.length)}
              </h2>
              {grants.map((grant, i) => {
                const flow = story.flows[i]
                return (
                  <div
                    key={grant.id}
                    className="flex items-center gap-4 rounded-xl border border-secondary p-3"
                  >
                    {grant.image && (
                      <Image
                        src={getIpfsUrl(grant.image, "pinata")}
                        alt={grant.title}
                        width={40}
                        height={40}
                        className="aspect-square size-[40px] rounded-full object-cover"
                      />
                    )}
                    <div className="flex flex-col space-y-1">
                      <Link
                        href={`/item/${grant.id}`}
                        className="text-sm font-medium leading-tight hover:underline"
                      >
                        {grant.title}
                      </Link>
                      {flow && (
                        <Link
                          href={`/flow/${flow.id}`}
                          className="text-xs text-muted-foreground hover:underline"
                        >
                          {flow.title}
                        </Link>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            <KeyPoints key_points={key_points} className="max-sm:hidden" />

            <Participants addresses={story.participants} />
          </aside>
        </div>
      </article>
      <StoryChat user={user} title={title} canEdit={canEditStory(story, user?.address)} />
    </AgentChatProvider>
  )
}
