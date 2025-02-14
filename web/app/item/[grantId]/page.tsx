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
import type { GrantPageData } from "./page-data/schema"
import type { DerivedData } from "@prisma/flows"

interface Props {
  params: Promise<{ grantId: string }>
}

export const runtime = "nodejs"

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { grantId } = await props.params

  const grant = await getGrant(grantId)
  const data = getPageData(grant.derivedData)

  return {
    title: grant.title,
    description: grant.tagline,
    openGraph: {
      images: [data?.coverImage ? getIpfsUrl(data.coverImage.url, "pinata") : grant.image],
    },
  }
}

export default async function GrantPage(props: Props) {
  const { grantId } = await props.params

  const [user, { flow, ...grant }] = await Promise.all([getUser(), getGrant(grantId)])

  if (grant.isFlow) return redirect(`/flow/${grant.id}/about`)

  const data = getPageData(grant.derivedData)
  if (!data) notFound()

  const { why, focus, who, how, builder, title } = data

  const canEdit = canEditGrant(grant, user?.address)

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
          <CoverImage coverImage={data.coverImage} title={title} tagline={data.tagline} />
          <div className="col-span-full grid grid-cols-1 gap-x-3 gap-y-4 lg:col-span-5 lg:grid-cols-2 lg:gap-x-4">
            <div className="flex flex-col gap-4">
              <MissionCard gradient={how.gradient} icon={how.icon} text={how.text} />
              <BeneficiariesCard
                gradient={who.gradient}
                beneficiaries={[
                  "Seniors (60+, 70+, 80+)",
                  "Obese individuals",
                  "People with paraplegia",
                ]}
              />
            </div>

            <div className="flex flex-col gap-4">
              <FocusCard gradient={focus.gradient} text={focus.text} />
              <ProgressCard
                image={why.image}
                text={
                  "Conducted 14 adapted Pilates classes serving 45 participants in 2 Greater São Paulo communities"
                }
              />
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
            <DialogTrigger className="group relative text-left duration-200 hover:scale-[1.02] xl:col-span-3">
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
            <DialogTrigger className="group relative text-left duration-200 hover:scale-[1.02] xl:col-span-3">
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

      <div className="relative pt-8">
        <div className="container flex flex-col items-end">
          <div className="translate-y-6 pr-8">
            <h1 className="text-4xl font-bold tracking-tighter">Follow our progress</h1>
            <p className="mt-1.5 text-lg tracking-tighter opacity-60">
              One step at a time, we're making a difference.
            </p>
          </div>
        </div>

        <BgGradient />
        <ImpactChain grantId={grant.id} activatedAt={new Date((grant.activatedAt || 0) * 1000)} />
      </div>

      <GrantChat grant={grant} user={user} canEdit={canEdit} />
    </AgentChatProvider>
  )
}

function getPageData(derivedData: Pick<DerivedData, "pageData"> | null): GrantPageData | null {
  const data = JSON.parse(derivedData?.pageData ?? "null") as GrantPageData | null
  if (!data || Object.keys(data).length === 0) return null
  return data
}

async function getGrant(grantId: string) {
  return database.grant.findUniqueOrThrow({
    where: { id: grantId, isTopLevel: false },
    include: {
      flow: true,
      derivedData: {
        select: { pageData: true, overallGrade: true, requirementsMetrics: true },
      },
    },
    ...getCacheStrategy(300),
  })
}
