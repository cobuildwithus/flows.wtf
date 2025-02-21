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
import { FocusCard } from "./cards/focus"
import { Stat } from "./cards/stats"
import { MissionCard } from "./cards/mission"
import { ProgressCard } from "./cards/progress"
import { Voters } from "./cards/voters"
import { BgGradient } from "./components/bg-gradient"
import { CurationStatus, CurationVote } from "./components/curation-card"
import { GrantActivity } from "./components/grant-activity"
import { GrantChat } from "./components/grant-chat"
import { ImpactDialog } from "./components/impact-dialog"
import { ImpactChain } from "./impact/impact-chain"

interface Props {
  params: Promise<{ grantId: string }>
}

export const runtime = "nodejs"

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { grantId } = await props.params

  const grant = await getGrant(grantId)
  if (!grant.derivedData) notFound()

  const { title, tagline, coverImage } = grant.derivedData

  return {
    title,
    description: tagline,
    openGraph: { images: [getIpfsUrl(coverImage, "pinata")] },
  }
}

export default async function GrantPage(props: Props) {
  const { grantId } = await props.params

  const [user, { flow, ...grant }] = await Promise.all([getUser(), getGrant(grantId)])

  if (grant.isFlow) return redirect(`/flow/${grant.id}/about`)
  if (!grant.derivedData) notFound()

  const {
    focus,
    mission,
    builder,
    title,
    beneficiaries,
    tagline,
    coverImage,
    gradients,
    progress,
  } = grant.derivedData

  const canEdit = canEditGrant(grant, user?.address)

  const impacts = database.impact.findMany({
    // where: { grantId },
    orderBy: { updatedAt: "asc" },
    take: 15,
  })

  return (
    <AgentChatProvider
      id={`grant-${grant.id}-${user?.address}`}
      type="flo"
      user={user}
      data={{ grantId: grant.id }}
      identityToken={await getPrivyIdToken()}
    >
      <div className="container mt-2.5 md:mt-6">
        <div className="flex items-center justify-between">
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

          <Builder
            bio={builder.bio}
            links={builder.links}
            recipient={grant.recipient as `0x${string}`}
          />
        </div>

        <div className="mt-3 grid grid-cols-12 gap-x-2 gap-y-4 lg:gap-x-4">
          <CoverImage coverImage={coverImage} title={title} tagline={tagline} />
          <div className="col-span-full grid grid-cols-1 gap-x-3 gap-y-4 lg:col-span-5 lg:grid-cols-2 lg:gap-x-4">
            <div className="flex flex-col gap-4">
              <MissionCard gradient={gradients.mission} text={mission} />
              <BeneficiariesCard gradient={gradients.beneficiaries} beneficiaries={beneficiaries} />
            </div>

            <div className="flex flex-col gap-4">
              <FocusCard gradient={gradients.focus} text={focus} />
              <ProgressCard image={coverImage} text={progress} />
            </div>
          </div>
          <div className="col-span-full cursor-pointer xl:col-span-3">
            <ImpactDialog grants={[{ ...grant, flow: { title: flow.title } }]} />
          </div>
          <div className="col-span-full rounded-xl border xl:col-span-9 xl:flex xl:items-center xl:justify-end">
            <Suspense fallback={<div className="h-[252px]" />}>
              <GrantActivity grant={grant} />
            </Suspense>
          </div>
          <Stat label="Budget">
            <Currency>{grant.monthlyIncomingFlowRate}</Currency>/mo
          </Stat>

          <Stat label="Total Earned">
            <AnimatedSalary value={grant.totalEarned} monthlyRate={grant.monthlyIncomingFlowRate} />
          </Stat>
          <Dialog>
            <DialogTrigger className="group relative col-span-6 text-left duration-200 hover:scale-[1.02] xl:col-span-3">
              <Stat label="Community Votes">{grant.votesCount}</Stat>
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
              <Stat label="Curation Status">
                <span className="lg:text-2xl">
                  {grant.status === Status.ClearingRequested ? (
                    <span className="inline-block rounded-sm bg-destructive px-1.5 py-0.5 text-lg text-destructive-foreground">
                      Removal Requested
                    </span>
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
                <div className={cn({ "divide-y divide-border [&>*]:py-5": grant.isDisputed })}>
                  <CurationStatus grant={grant} flow={flow} />
                  {grant.isDisputed && <CurationVote grant={grant} flow={flow} />}
                </div>
              </Suspense>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="relative pt-8 max-sm:pb-28">
        <div className="container flex flex-col max-sm:mb-6 md:items-end">
          <div className="md:translate-y-6 md:pr-8">
            <h1 className="text-3xl font-bold tracking-tighter md:text-4xl">Follow our progress</h1>
            <p className="mt-1.5 text-sm tracking-tighter opacity-60 md:text-lg">
              One step at a time, we're making a difference.
            </p>
          </div>
        </div>

        <BgGradient />
        <Suspense fallback={<div className="h-[300px]" />}>
          <ImpactChain
            impacts={await impacts}
            activatedAt={new Date((grant.activatedAt || 0) * 1000)}
          />
        </Suspense>
      </div>

      <GrantChat grant={grant} user={user} canEdit={canEdit} />
    </AgentChatProvider>
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
          focus: true,
          progress: true,
          builder: true,
          gradients: true,
          beneficiaries: true,
          overallGrade: true,
          requirementsMetrics: true,
        },
      },
    },
    ...getCacheStrategy(300),
  })
}
