import { GrantStatusCountBadges } from "@/components/ui/grant-status-count-badges"
import database, { getCacheStrategy } from "@/lib/database/edge"
import { getPool } from "@/lib/database/queries/pool"
import { getEthAddress } from "@/lib/utils"
import { VotingProvider } from "@/lib/voting/voting-context"
import { Grant } from "@prisma/flows"
import Link from "next/link"
import { base } from "viem/chains"
import FlowsList from "./components/flows-list"
import { FlowsStories } from "./components/flows-stories"
import { CTAButtons } from "./flow/[flowId]/components/cta-buttons"
import { VotingBar } from "./flow/[flowId]/components/voting-bar"
import { FullDiagram } from "./explore/diagram"
import { Suspense } from "react"

export default async function Home() {
  const [pool, activeFlows] = await Promise.all([
    getPool(),
    database.grant.findMany({
      where: { isFlow: true, isActive: true, isTopLevel: false },
      ...getCacheStrategy(120),
    }),
  ])

  activeFlows.sort(sortGrants)

  return (
    <VotingProvider chainId={base.id} contract={getEthAddress(pool.recipient)}>
      <main>
        <div className="container">
          <FlowsStories />
        </div>

        <div className="container mt-12 flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-4">
              <h3 className="font-semibold leading-none tracking-tight md:text-lg">
                <Link href={`/flow/${pool.id}`} className="hover:text-primary">
                  Explore Flows
                </Link>
              </h3>
              <GrantStatusCountBadges
                id={pool.id}
                flow={{
                  activeRecipientCount: getSum(activeFlows, "activeRecipientCount"),
                  awaitingRecipientCount: getSum(activeFlows, "awaitingRecipientCount"),
                  challengedRecipientCount: getSum(activeFlows, "challengedRecipientCount"),
                }}
                alwaysShowAll
                showLabel
              />
            </div>
            <p className="mt-1 text-sm text-muted-foreground max-sm:hidden">{pool.tagline}</p>
          </div>

          <CTAButtons />
        </div>

        <div className="container mt-6">
          <FlowsList flows={activeFlows} />
        </div>

        <div className="mt-12">
          <div className="container mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold leading-none tracking-tight md:text-lg">
                  <Link href="/explore" className="hover:text-primary">
                    Dive into the flow
                  </Link>
                </h3>
                <p className="mt-1 text-sm text-muted-foreground max-sm:hidden">
                  Explore the builders making impact
                </p>
              </div>
              <CTAButtons />
            </div>
          </div>
          <div className="flex h-[750px] grow flex-col">
            <Suspense
              fallback={
                <div className="flex h-full items-center justify-center">Loading diagram...</div>
              }
            >
              <FullDiagram flows={await getFlows()} pool={pool} />
            </Suspense>
          </div>
        </div>
      </main>
      <VotingBar />
    </VotingProvider>
  )
}

const getFlows = async () => {
  const flows = await database.grant.findMany({
    where: { isActive: true, isFlow: true, isTopLevel: false },
    include: { subgrants: { where: { isActive: true } } },
    ...getCacheStrategy(3600),
  })
  return flows
}

function getSum(flows: Grant[], key: keyof Grant): number {
  return flows.reduce((sum, flow) => sum + (flow[key] as number), 0)
}

function sortGrants(a: Grant, b: Grant) {
  const aApproved = a.activeRecipientCount
  const bApproved = b.activeRecipientCount
  const aChallenged = a.challengedRecipientCount
  const bChallenged = b.challengedRecipientCount
  const aAwaiting = a.awaitingRecipientCount
  const bAwaiting = b.awaitingRecipientCount

  if (aApproved !== bApproved) {
    return bApproved - aApproved
  } else if (aChallenged !== bChallenged) {
    return bChallenged - aChallenged
  } else if (aAwaiting !== bAwaiting) {
    return bAwaiting - aAwaiting
  } else {
    return 0
  }
}
