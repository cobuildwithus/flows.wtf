import { GrantStatusCountBadges } from "@/components/ui/grant-status-count-badges"
import { getUser } from "@/lib/auth/user"
import database from "@/lib/database/edge"
import { getPool } from "@/lib/database/queries/pool"
import { getEthAddress } from "@/lib/utils"
import { VotingProvider } from "@/lib/voting/voting-context"
import Link from "next/link"
import { base } from "viem/chains"
import FlowsList from "./components/flows-list"
import type { LimitedFlow } from "./components/flows-table"
import { HomepageIntro } from "./components/homepage-intro"
import { CTAButtons } from "./flow/[flowId]/components/cta-buttons"
import { VotingBar } from "./flow/[flowId]/components/voting-bar"

export default async function Home() {
  const [pool, activeFlows, user] = await Promise.all([
    getPool(),
    database.grant.findMany({
      where: { isFlow: true, isActive: true, isTopLevel: false },
      omit: { description: true },
      orderBy: [
        { activeRecipientCount: "desc" },
        { challengedRecipientCount: "desc" },
        { awaitingRecipientCount: "desc" },
      ],
    }),
    getUser(),
  ])

  return (
    <VotingProvider chainId={base.id} contract={getEthAddress(pool.recipient)}>
      <main>
        <div className="container mt-6">
          <HomepageIntro user={user} />
        </div>
        <div className="container mt-6 flex items-center justify-between">
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
