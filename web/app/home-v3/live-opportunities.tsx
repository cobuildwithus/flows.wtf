import Link from "next/link"
import { AgentChatProvider } from "../chat/components/agent-chat"
import { StartupsTable } from "./startups-table"
import { OpportunitiesFlowsList } from "./opportunities-flows-list"
import { getLiveOpportunitiesData } from "@/lib/home-v3/live-opportunities-data"
import { getStartupsTableData } from "@/lib/home-v3/startups-table-data"
import type { User } from "@/lib/auth/user"

interface Props {
  user: User | undefined
  privyIdToken: string | undefined
}

export async function LiveOpportunities({ user, privyIdToken }: Props) {
  const [{ opportunities, flows }, startups] = await Promise.all([
    getLiveOpportunitiesData(),
    getStartupsTableData(),
  ])

  const featuredOpportunities = opportunities.slice(0, 4)
  const featuredFlows = flows.slice(0, 6)

  return (
    <AgentChatProvider
      id={`live-opportunities-${user?.address}`}
      type="flo"
      user={user}
      identityToken={privyIdToken}
    >
      <section className="bg-white py-20 dark:bg-background lg:py-28">
        <div className="container">
          {/* Section Header */}
          <div className="mb-10">
            <h2 className="text-2xl font-semibold md:text-5xl">Get involved</h2>
            <p className="mt-2 text-muted-foreground">Back projects or get funded</p>
          </div>

          {/* Two Column Layout */}
          <div className="grid gap-8 lg:grid-cols-3 lg:gap-12">
            {/* Left Column - Startups Table */}
            <div className="lg:col-span-2">
              <StartupsTable startups={startups} />
            </div>

            {/* Right Column - Opportunities & Flows */}
            <div className="lg:col-span-1">
              <OpportunitiesFlowsList opportunities={featuredOpportunities} flows={featuredFlows} />

              <div className="mt-6 text-center">
                <Link href="/apply" className="font-medium text-emerald-600 hover:underline">
                  See all openings →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </AgentChatProvider>
  )
}
