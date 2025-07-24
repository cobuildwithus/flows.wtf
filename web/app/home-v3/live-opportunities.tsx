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
  const featuredFlows = flows.slice(0, 9 - featuredOpportunities.length)

  return (
    <AgentChatProvider
      id={`live-opportunities-${user?.address}`}
      type="flo"
      user={user}
      identityToken={privyIdToken}
    >
      <section id="live-opportunities" className="py-20 lg:py-28">
        <div className="container">
          {/* Section Header */}
          <div className="mb-10">
            <h2 className="text-4xl font-semibold md:text-6xl">Get involved</h2>
            <p className="mt-2 text-muted-foreground">Back projects or get funded</p>
          </div>

          {/* Content */}
          <div className="space-y-12">
            <div className="flex flex-col">
              <h3 className="text-lg font-semibold">Back projects</h3>
              <StartupsTable startups={startups} />
            </div>
            <div className="flex flex-col space-y-3">
              <h3 className="text-lg font-semibold">Get funded</h3>
              <OpportunitiesFlowsList opportunities={featuredOpportunities} flows={featuredFlows} />
            </div>
            <div className="text-center">
              <Link href="/apply" className="font-medium text-emerald-600 hover:underline">
                See all openings →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </AgentChatProvider>
  )
}
