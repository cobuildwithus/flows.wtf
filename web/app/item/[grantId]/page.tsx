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
import { EmptyState } from "@/components/ui/empty-state"
import { getPrivyIdToken } from "@/lib/auth/get-user-from-cookie"
import { getUser } from "@/lib/auth/user"
import database from "@/lib/database/flows-db"
import { canEditGrant } from "@/lib/database/helpers"
import { getGrantFeedbackCasts } from "@/lib/database/queries/get-grant-feedback"
import { getFarcasterUserByEthAddress } from "@/lib/farcaster/get-user"
import { cn, getIpfsUrl } from "@/lib/utils"
import { ZoomInIcon } from "lucide-react"
import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import { BeneficiariesCard } from "./cards/beneficiaries"
import { Builder } from "./cards/builder"
import { CoverImage } from "./cards/cover-image"
import { DeliverablesCard } from "./cards/deliverables"
import { MissionCard } from "./cards/mission"
import { Stat } from "./cards/stats"
import { Voters } from "./cards/voters"
import { BgGradient } from "./components/bg-gradient"
import { GrantActivity } from "./components/grant-activity"
import { GrantChat } from "./components/grant-chat"
import { GrantFeedback } from "./components/grant-feedback"
import { GrantGrade } from "./components/grant-grade"
import { GrantStatus } from "./components/grant-status"
import { getGrant } from "./get-grant"
import { GrantGenerating } from "./components/grant-generating"
import { ImpactChain } from "./impact/impact-chain"
import { getImpactSummaryType, ImpactSummary } from "./impact/impact-summary"

interface Props {
  params: Promise<{ grantId: string }>
  searchParams: Promise<{ impactId?: string }>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { grantId } = await props.params

  const grant = await getGrant(grantId)

  if (!grant.derivedData) return {}

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
  if (!grant.derivedData) {
    return <GrantGenerating />
  }

  const { mission, builder, title, beneficiaries, tagline, coverImage, gradients, deliverables } =
    grant.derivedData

  const canEdit = canEditGrant(grant, user?.address)

  const [impacts, grantBuilder] = await Promise.all([
    database.impact.findMany({
      where: { grantId, deletedAt: null },
      orderBy: [{ date: "desc" }, { updatedAt: "desc" }],
    }),
    getFarcasterUserByEthAddress(grant.recipient as `0x${string}`),
  ])

  const impactSummaryType = getImpactSummaryType({ grant, impacts, flow })
  const hasImpactSummary = impactSummaryType !== "none"

  return (
    <>
      <div className="mt-2.5 md:mt-6">
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
            <AgentChatProvider
              id={`grant-${grant.id}-${user?.address}`}
              type="flo"
              user={user}
              data={{ grantId: grant.id }}
              identityToken={await getPrivyIdToken()}
            >
              <GrantChat grant={grant} user={user} canEdit={canEdit} />
              {title && coverImage && tagline && (
                <div className="relative col-span-full lg:col-span-7">
                  <GrantStatus grant={grant} flow={flow} />
                  <div className="absolute right-4 top-4 z-30">
                    <GrantGrade grant={grant} />
                  </div>
                  <CoverImage coverImage={coverImage} title={title} tagline={tagline} />
                </div>
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
                  <DeliverablesCard
                    gradient={gradients?.deliverables}
                    deliverables={deliverables}
                  />
                )}
              </div>

              {hasImpactSummary && (
                <div className="col-span-full xl:col-span-7">
                  <ImpactSummary grant={grant} impacts={impacts} flow={flow} />
                </div>
              )}

              <div
                className={cn(
                  "col-span-full rounded-xl border xl:flex xl:items-center xl:justify-end",
                  {
                    "xl:col-span-5": hasImpactSummary,
                    "xl:col-span-6 xl:row-span-2": !hasImpactSummary,
                  },
                )}
              >
                <Suspense fallback={<div className="h-[252px]" />}>
                  <GrantActivity grant={grant} />
                </Suspense>
              </div>

              <Stat label="Budget" className="">
                <Currency flow={grant}>{grant.monthlyIncomingFlowRate}</Currency>
                /mo
              </Stat>

              <Stat label="Total Earned">
                <AnimatedSalary
                  value={grant.totalEarned}
                  monthlyRate={grant.monthlyIncomingFlowRate}
                />
              </Stat>
              <Dialog>
                <DialogTrigger className="group relative col-span-6 h-full text-left duration-200 hover:scale-[1.02] xl:col-span-3">
                  <Stat label="Votes">{grant.allocationsCount}</Stat>
                  <ZoomInIcon className="absolute right-4 top-4 size-6 opacity-0 transition-opacity duration-200 group-hover:opacity-75" />
                </DialogTrigger>
                <DialogContent>
                  <DialogTitle>Voters</DialogTitle>
                  <div className="mt-4">
                    <Suspense>
                      <Voters
                        contract={grant.parentContract as `0x${string}`}
                        recipientId={grant.recipientId}
                        flowVotesCount={flow.allocationsCount}
                      />
                    </Suspense>
                  </div>
                </DialogContent>
              </Dialog>
              <div className="col-span-full xl:col-span-3">
                <GrantFeedback
                  castsPromise={getGrantFeedbackCasts(grantId)}
                  grantId={grant.id}
                  builderUsername={grantBuilder?.fname || ""}
                />
              </div>
            </AgentChatProvider>
          </div>
        </div>

        {impacts.length > 0 ? (
          <div className="relative overflow-hidden">
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
                <div className="mb-24 mt-12">
                  <ImpactChain
                    impacts={impacts}
                    activatedAt={new Date((grant.activatedAt || 0) * 1000)}
                    canEdit={canEdit}
                    impactId={impactId}
                    disableMetricsWarning={grant.flowId === NOUNS_ART}
                  />
                </div>
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
    </>
  )
}

const NOUNS_ART = "0x0015ce9c043a4dd4b1e25532a85ec71207b69e105b4ed03e3d6e038a0b331cf4"
