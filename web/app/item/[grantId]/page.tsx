import { AgentChatProvider } from "@/app/chat/components/agent-chat"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Icon } from "@/components/ui/icon"
import { getUser } from "@/lib/auth/user"
import database, { getCacheStrategy } from "@/lib/database/edge"
import { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import { Suspense } from "react"
import { Builder } from "./cards/builder"
import { CoverImage } from "./cards/cover-image"
import { FocusCard } from "./cards/focus"
import { HowCard } from "./cards/how"
import { Media } from "./cards/media"
import { Metrics } from "./cards/metrics"
import { Plan } from "./cards/plan"
import { Stats } from "./cards/stats"
import { Timeline } from "./cards/timeline"
import { Voters } from "./cards/voters"
import { WhoCard } from "./cards/who"
import { WhyCard } from "./cards/why"
import { BgGradient } from "./components/bg-gradient"
import { CurationCard } from "./components/curation-card"
import { GrantChat } from "./components/grant-chat"
import { GrantStories } from "./components/grant-stories"
import { GrantPageData } from "./page-data/schema"

interface Props {
  params: Promise<{ grantId: string }>
}

export const runtime = "nodejs"

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { grantId } = await props.params

  const grant = await database.grant.findFirstOrThrow({
    where: { id: grantId, isTopLevel: false },
    select: { title: true, tagline: true },
    ...getCacheStrategy(1200),
  })

  return { title: grant.title, description: grant.tagline }
}

export default async function GrantPage(props: Props) {
  const { grantId } = await props.params

  const [user, { flow, ...grant }] = await Promise.all([
    getUser(),
    database.grant.findUniqueOrThrow({
      where: { id: grantId, isActive: true, isTopLevel: false },
      include: { flow: true, derivedData: { select: { pageData: true } } },
      ...getCacheStrategy(600), // ToDo: Invalidate on edit
    }),
  ])

  if (grant.isFlow) return redirect(`/flow/${grant.id}/about`)

  const data = JSON.parse(grant.derivedData?.pageData ?? "null") as GrantPageData | null
  if (!data || Object.keys(data).length === 0) notFound()

  const { why, focus, who, how, builder, title } = data

  return (
    <AgentChatProvider
      id={`grant-${grant.id}-${user?.address}`}
      type="flo"
      user={user}
      data={{ grantId: grant.id }}
    >
      <div className="container mt-2.5 pb-24 md:mt-6">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Flows</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/flow/${flow.id}`}>{flow.title}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="max-sm:hidden" />
            <BreadcrumbItem className="max-sm:hidden">
              <BreadcrumbPage>{title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="grid grid-cols-12 gap-x-2 gap-y-4 lg:gap-x-4">
          <CoverImage coverImage={data.coverImage} title={title} tagline={data.tagline} />

          <div className="col-span-full grid grid-cols-1 gap-x-3 gap-y-4 lg:col-span-5 lg:grid-cols-2 lg:gap-x-4">
            <div className="flex flex-col gap-4">
              <HowCard gradient={how.gradient} icon={how.icon} text={how.text} />
              <WhoCard gradient={who.gradient} text={who.text} recipient={grant.recipient} />
            </div>

            <div className="flex flex-col gap-4">
              <FocusCard gradient={focus.gradient} text={focus.text} />
              <WhyCard image={why.image} text={why.text} />
            </div>
          </div>

          <Metrics metrics={data.metrics} />

          <Builder
            tags={builder.tags}
            bio={builder.bio}
            links={builder.links}
            recipient={grant.recipient as `0x${string}`}
          />

          {data.cards.map((card) => (
            <div
              key={card.title}
              className="col-span-full rounded-xl border bg-card p-5 lg:col-span-4"
            >
              <div className="flex flex-col items-start gap-4">
                <Icon name={card.icon} className="size-9 text-primary" />
                <h3 className="font-bold tracking-tight">{card.title}</h3>
                <p className="leading-relaxed opacity-60 max-sm:text-sm">{card.description}</p>
              </div>
            </div>
          ))}

          <Media media={data.media} />
        </div>

        <div className="relative mt-4 grid grid-cols-12 gap-4">
          <BgGradient />

          <div className="col-span-full lg:col-span-4">
            <Timeline timeline={data.timeline} />
          </div>

          <div className="col-span-full flex flex-col space-y-4 lg:col-span-4">
            <Stats grant={grant} />

            <Suspense>
              <Voters
                contract={grant.parentContract as `0x${string}`}
                grantId={grant.id}
                flowVotesCount={flow.votesCount}
              />
            </Suspense>
          </div>

          <div className="col-span-full lg:col-span-4">
            <Suspense>
              <CurationCard grant={grant} flow={flow} className="h-full" />
            </Suspense>
          </div>
        </div>

        <Plan plan={data.plan} className="mt-10" />

        <GrantStories grantId={grant.id} className="mt-10" />
      </div>
      <GrantChat grant={grant} user={user} />
    </AgentChatProvider>
  )
}
