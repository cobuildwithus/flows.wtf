import { AgentChatProvider } from "@/app/chat/components/agent-chat"
import { AnimatedSalary } from "@/components/global/animated-salary"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Currency } from "@/components/ui/currency"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { getPrivyIdToken } from "@/lib/auth/get-user-from-cookie"
import { getUser } from "@/lib/auth/user"
import database, { getCacheStrategy } from "@/lib/database/edge"
import { canEditGrant } from "@/lib/database/helpers"
import { Status } from "@/lib/enums"
import { cn, getIpfsUrl } from "@/lib/utils"
import { ZoomInIcon } from "lucide-react"
import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import { Suspense } from "react"
import { BeneficiariesCard } from "./cards/beneficiaries"
import { Builder } from "./cards/builder"
import { CoverImage } from "./cards/cover-image"
import { Stat } from "./cards/stats"
import { MissionCard } from "./cards/mission"
import { DeliverablesCard } from "./cards/deliverables"
import { Voters } from "./cards/voters"
import { BgGradient } from "./components/bg-gradient"
import { CurationStatus, CurationVote } from "./components/curation-card"
import { GrantActivity } from "./components/grant-activity"
import { GrantChat } from "./components/grant-chat"
import { ImpactDialog } from "./components/grades-dialog"
import { ImpactChain } from "./impact/impact-chain"
import { Badge } from "@/components/ui/badge"
import { FlowRemovedCard } from "./components/flow-removed-card"
import { EmptyState } from "@/components/ui/empty-state"
import { getImpactSummaryType, ImpactSummary } from "./impact/impact-summary"

interface Props {
  params: Promise<{ grantId: string }>
  searchParams: Promise<{ impactId?: string }>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { grantId } = await props.params

  const grant = await getGrant(grantId)
  if (!grant.derivedData) notFound()

  const { title, tagline, coverImage } = grant.derivedData

  return {
    title,
    description: tagline,
    openGraph: { images: [getIpfsUrl(coverImage || grant.image, "pinata")] },
  }
}

export default async function GrantPage(props: Props) {
  const { grantId } = await props.params
  const { impactId } = await props.searchParams

  const [user, { flow, ...grant }] = await Promise.all([getUser(), getGrant(grantId)])

  if (grant.isFlow) return redirect(`/flow/${grant.id}/about`)
  if (!grant.derivedData) notFound()

  const { mission, builder, title, beneficiaries, tagline, coverImage, gradients, deliverables } =
    grant.derivedData

  const canEdit = canEditGrant(grant, user?.address)

  const impacts = await database.impact.findMany({
    where: { grantId, deletedAt: null },
    orderBy: [{ date: "desc" }, { updatedAt: "desc" }],
  })

  const impactSummaryType = getImpactSummaryType({ grant, impacts, flow })
  const hasImpactSummary = impactSummaryType !== "none"

  return (
    <>
      <div className="mt-2.5 pb-24 md:mt-6">
        <div className="container">
          <div className="md:flex md:items-center md:justify-between">
            <Breadcrumb>
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

            {builder && (
              <Builder
                bio={builder.bio}
                links={builder.links}
                recipient={grant.recipient as `0x${string}`}
              />
            )}
          </div>

          <div className="mt-3 grid grid-cols-12 gap-x-2 gap-y-4 lg:gap-x-4">
            {title && coverImage && tagline && (
              <CoverImage coverImage={coverImage} title={title} tagline={tagline} />
            )}
            <div className="col-span-full grid grid-cols-1 gap-x-3 gap-y-4 lg:col-span-5 lg:grid-cols-2 lg:gap-x-4">
              <div className="flex flex-col gap-4">
                {gradients && mission && (
                  <MissionCard gradient={gradients.mission} text={mission} />
                )}
                {gradients && beneficiaries && (
                  <BeneficiariesCard
                    gradient={gradients.beneficiaries}
                    beneficiaries={beneficiaries}
                  />
                )}
              </div>

              {deliverables && gradients && (
                <DeliverablesCard gradient={gradients?.deliverables} deliverables={deliverables} />
              )}
            </div>

            <div className="col-span-full cursor-pointer xl:col-span-3 xl:col-start-1">
              <ImpactDialog grants={[{ ...grant, flow: { title: flow.title } }]} />
            </div>

            {hasImpactSummary && (
              <div className="col-span-full xl:col-span-9">
                <ImpactSummary grant={grant} impacts={impacts} flow={flow} />
              </div>
            )}

            <div
              className={cn(
                "col-span-full rounded-xl border xl:flex xl:items-center xl:justify-end",
                {
                  "xl:col-span-8": hasImpactSummary,
                  "xl:col-span-9": !hasImpactSummary,
                },
              )}
            >
              <Suspense fallback={<div className="h-[252px]" />}>
                <GrantActivity grant={grant} />
              </Suspense>
            </div>
            {/* <div className="xl:col-span-4">
              <Card className="flex h-full w-full flex-col items-center justify-center">
                Feedback / Testimonials
              </Card>
            </div> */}

            <Stat label="Budget" className="xl:col-start-1">
              <Currency>{grant.monthlyIncomingFlowRate}</Currency>/mo
            </Stat>

            <Stat label="Total Earned">
              <AnimatedSalary
                value={grant.totalEarned}
                monthlyRate={grant.monthlyIncomingFlowRate}
              />
            </Stat>
            <Dialog>
              <DialogTrigger className="group relative col-span-6 text-left duration-200 hover:scale-[1.02] xl:col-span-3">
                <Stat label="Votes">{grant.votesCount}</Stat>
                <ZoomInIcon className="absolute right-4 top-4 size-6 opacity-0 transition-opacity duration-200 group-hover:opacity-75" />
              </DialogTrigger>
              <DialogContent>
                <DialogTitle>Voters</DialogTitle>
                <div className="mt-4">
                  <Suspense>
                    <Voters
                      contract={grant.parentContract as `0x${string}`}
                      grantId={grant.id}
                      flowVotesCount={flow.votesCount}
                    />
                  </Suspense>
                </div>
              </DialogContent>
            </Dialog>
            <Dialog>
              <DialogTrigger className="group relative col-span-6 text-left duration-200 hover:scale-[1.02] xl:col-span-3">
                <Stat label="Status">
                  <span className="lg:text-2xl">
                    {grant.status === Status.ClearingRequested ||
                    grant.status === Status.Absent ||
                    flow.isRemoved ? (
                      <Badge variant="warning" className="text-lg">
                        {grant.status === Status.ClearingRequested ? "Challenged" : "Removed"}
                      </Badge>
                    ) : (
                      "Active"
                    )}
                  </span>
                </Stat>
                <ZoomInIcon className="absolute right-4 top-4 size-6 opacity-0 transition-opacity duration-200 group-hover:opacity-75" />
              </DialogTrigger>
              <DialogContent>
                <DialogTitle>Grant Curation</DialogTitle>
                <Suspense>
                  {flow.isActive ? (
                    <div className={cn({ "divide-y divide-border [&>*]:py-5": grant.isDisputed })}>
                      <CurationStatus grant={grant} flow={flow} />
                      {grant.isDisputed && <CurationVote grant={grant} flow={flow} />}
                    </div>
                  ) : (
                    <FlowRemovedCard flow={flow} />
                  )}
                </Suspense>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {impacts.length > 0 ? (
          <div className="relative mt-12">
            <BgGradient />
            <AgentChatProvider
              id={`grant-edit-${grant.id}-${user?.address}`}
              type="flo"
              user={user}
              data={{ grantId: grant.id }}
              identityToken={await getPrivyIdToken()}
              initialMessages={[]}
            >
              <Suspense fallback={<div className="h-[300px]" />}>
                <ImpactChain
                  impacts={impacts}
                  activatedAt={new Date((grant.activatedAt || 0) * 1000)}
                  canEdit={canEdit}
                  impactId={impactId}
                  disableMetricsWarning={grant.flowId === NOUNS_ART}
                />
              </Suspense>
            </AgentChatProvider>
          </div>
        ) : (
          <div className="my-32">
            <EmptyState
              size={100}
              title="No impact"
              description="No clear impact verified for this grant yet"
            />
          </div>
        )}
      </div>
      <AgentChatProvider
        id={`grant-${grant.id}-${user?.address}`}
        type="flo"
        user={user}
        data={{ grantId: grant.id }}
        identityToken={await getPrivyIdToken()}
      >
        <GrantChat grant={grant} user={user} canEdit={canEdit} />
      </AgentChatProvider>
    </>
  )
}

async function getGrant(grantId: string) {
  return database.grant.findUniqueOrThrow({
    where: { id: grantId, isTopLevel: false },
    include: {
      flow: true,
      derivedData: {
        select: {
          title: true,
          tagline: true,
          coverImage: true,
          shortDescription: true,
          mission: true,
          builder: true,
          gradients: true,
          deliverables: true,
          beneficiaries: true,
          overallGrade: true,
          requirementsMetrics: true,
          impactMetrics: true,
          impactSummary: true,
        },
      },
    },
    ...getCacheStrategy(300),
  })
}

const NOUNS_ART = "0x0015ce9c043a4dd4b1e25532a85ec71207b69e105b4ed03e3d6e038a0b331cf4"
