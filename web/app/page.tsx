import { GrantStatusCountBadges } from "@/components/ui/grant-status-count-badges"
import database from "@/lib/database/edge"
import { getPool } from "@/lib/database/queries/pool"
import { getEthAddress } from "@/lib/utils"
import { VotingProvider } from "@/lib/voting/voting-context"
import Link from "next/link"
import { base } from "viem/chains"
import FlowsList from "./components/flows-list"
import { FlowsStories } from "./components/flows-stories"
import { CTAButtons } from "./flow/[flowId]/components/cta-buttons"
import { VotingBar } from "./flow/[flowId]/components/voting-bar"
import { getUser } from "@/lib/auth/user"
import type { LimitedFlow } from "./components/flows-table"

export default async function Home() {
  const [pool, activeFlows, user] = await Promise.all([
    getPool(),
    database.grant.findMany({
      where: { isFlow: true, isActive: true, isTopLevel: false },
      omit: { description: true },

    }),
    getUser(),
  ])

  activeFlows.sort(sortFlows)

  return (
    <VotingProvider chainId={base.id} contract={getEthAddress(pool.recipient)}>
      <main>
        <div className="container">
          <FlowsStories user={user} />
        </div>

        <div className="container mt-12 flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-4">
              <h3 className="text-lg font-semibold leading-none tracking-tight md:text-xl">
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

        <div className="container my-6">
          <FlowsList flows={activeFlows} />
        </div>
      </main>
      <VotingBar />
    </VotingProvider>
  )
}

function getSum(flows: LimitedFlow[], key: keyof LimitedFlow): number {
  return flows.reduce((sum, flow) => sum + (flow[key] as number), 0)
}

function sortFlows(a: LimitedFlow, b: LimitedFlow) {
  const aApproved = a.activeRecipientCount
  const bApproved = b.activeRecipientCount
  const aChallenged = a.challengedRecipientCount
  const bChallenged = b.challengedRecipientCount
  const aAwaiting = a.awaitingRecipientCount
  const bAwaiting = b.awaitingRecipientCount

  if (aApproved !== bApproved) {
    return bApproved - aApproved
  }
  if (aChallenged !== bChallenged) {
    return bChallenged - aChallenged
  }
  if (aAwaiting !== bAwaiting) {
    return bAwaiting - aAwaiting
  }
  return 0
}
