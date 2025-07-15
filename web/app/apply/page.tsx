import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Currency } from "@/components/ui/currency"
import database from "@/lib/database/flows-db"
import { getIpfsUrl } from "@/lib/utils"
import { ExclamationTriangleIcon } from "@radix-ui/react-icons"
import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { OpportunityItem } from "../../components/opportunities/opportunity-item"
import { getStartupData } from "@/lib/onchain-startup/startup"
import { AgentChatProvider } from "../chat/components/agent-chat"
import { getUser } from "@/lib/auth/user"
import { getPrivyIdToken } from "@/lib/auth/get-user-from-cookie"

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Apply | Build something that matters",
    description: "Get paid to build something that matters",
  }
}

export default async function ApplyPage() {
  const [flows, opportunities, user, privyIdToken] = await Promise.all([
    database.grant.findMany({
      where: { isFlow: true, isActive: true, isTopLevel: false },
      select: {
        id: true,
        title: true,
        image: true,
        tagline: true,
        monthlyIncomingFlowRate: true,
        activeRecipientCount: true,
        monthlyOutgoingFlowRate: true,
        underlyingTokenDecimals: true,
        underlyingTokenPrefix: true,
        underlyingTokenSymbol: true,
      },
      orderBy: [{ title: "asc" }],
    }),
    database.opportunity.findMany({
      where: { status: 1 },
      include: {
        _count: { select: { drafts: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    getUser(),
    getPrivyIdToken(),
  ])

  // Filter opportunities to only include those with valid startup IDs
  const validOpportunities = opportunities.filter((opportunity) => {
    try {
      getStartupData(opportunity.startupId)
      return true
    } catch {
      return false
    }
  })

  // sort flows by monthly incoming flow rate and map to display funding amount
  const sortedFlows = flows
    .sort((a, b) => {
      return Number(b.monthlyIncomingFlowRate) - Number(a.monthlyIncomingFlowRate)
    })
    .map((flow) => ({
      ...flow,
      displayAmount: Number(flow.monthlyOutgoingFlowRate) / (flow.activeRecipientCount || 1),
    }))

  return (
    <div className="relative isolate">
      {/* Opportunities Section - Clean white background */}
      <div className="bg-white dark:bg-background">
        <div className="container py-12 md:py-16">
          <div className="mx-auto max-w-screen-lg">
            <SectionHeader
              label="Opportunities"
              title="Join a team"
              description="Apply to open positions at startups in the ecosystem."
            />

            <div className="mt-10 md:mt-16">
              {validOpportunities.length === 0 ? (
                <div className="flex items-center justify-center">
                  <Alert>
                    <ExclamationTriangleIcon className="size-4" />
                    <AlertTitle>No opportunities available</AlertTitle>
                    <AlertDescription>There are no open positions at this time.</AlertDescription>
                  </Alert>
                </div>
              ) : (
                <AgentChatProvider
                  id={`startup-opportunities-${user?.address}`}
                  type="flo"
                  user={user}
                  identityToken={privyIdToken}
                >
                  <div className="mx-auto max-w-2xl space-y-4">
                    {validOpportunities.map((opportunity) => (
                      <OpportunityItem key={opportunity.id} opportunity={opportunity} />
                    ))}
                  </div>
                </AgentChatProvider>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Flows Section - With gradient background */}
      <div className="relative overflow-hidden bg-gradient-to-b from-background to-secondary/5">
        <div
          aria-hidden="true"
          className="absolute inset-x-0 -z-10 transform-gpu overflow-hidden blur-3xl"
        >
          <div
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
            className="mx-auto aspect-[1155/678] w-[1155px] bg-gradient-to-tr from-secondary/20 to-primary/25"
          />
        </div>

        <div className="container py-12 pb-20 md:py-16 md:pb-24">
          <SectionHeader
            label="Get funded"
            title="Have your own idea?"
            description="Select the flow that best fits your project."
          />

          <div className="mx-auto mt-10 max-w-screen-lg md:mt-16">
            {flows.length === 0 && (
              <div className="flex items-center justify-center">
                <Alert variant="destructive">
                  <ExclamationTriangleIcon className="size-4" />
                  <AlertTitle>No flows found</AlertTitle>
                  <AlertDescription>
                    There are no flows available for you to apply to.
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {flows.length > 0 && (
              <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-3 lg:gap-5">
                {sortedFlows.map((flow) => (
                  <Link
                    href={`/apply/${flow.id}`}
                    key={flow.id}
                    className="group h-full transition-transform md:hover:-translate-y-2"
                  >
                    <Card className="h-full bg-card/75 dark:bg-transparent">
                      <CardContent className="flex h-full flex-col justify-between">
                        <div className="flex flex-col items-start">
                          <Image
                            src={getIpfsUrl(flow.image)}
                            alt={flow.title}
                            width={64}
                            height={64}
                            className="mb-4 size-10 rounded-full object-cover lg:size-16"
                          />

                          <h3 className="mt-0.5 line-clamp-1 text-left text-sm font-medium transition-colors group-hover:text-primary lg:text-lg">
                            {flow.title}
                          </h3>
                          <p className="mb-2 line-clamp-2 text-left text-xs text-muted-foreground lg:text-sm">
                            {flow.tagline}
                          </p>
                        </div>
                        <div>
                          <Badge>
                            <Currency flow={flow}>{Number(flow.displayAmount)}</Currency>
                            /mo
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function SectionHeader({
  label,
  title,
  description,
}: {
  label: string
  title: string
  description: string
}) {
  return (
    <div className="mx-auto max-w-4xl text-center">
      <h2 className="text-base font-semibold text-primary">{label}</h2>
      <p className="mt-2.5 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
        {title}
      </p>
      <p className="mx-auto mt-4 max-w-2xl text-pretty text-center text-sm text-muted-foreground md:mt-6 lg:text-lg">
        {description}
      </p>
    </div>
  )
}
