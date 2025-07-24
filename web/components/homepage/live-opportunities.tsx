import Link from "next/link"
import { AgentChatProvider } from "@/app/chat/components/agent-chat"
import { StartupsTable } from "./startups-table"
import { OpportunitiesScroller } from "./opportunities-scroller"
import { getLiveOpportunitiesData } from "@/lib/homepage/live-opportunities-data"
import { getStartupsTableData } from "@/lib/homepage/startups-table-data"
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

  // Get more items for the scroller
  const scrollerOpportunities = opportunities.slice(0, 6)
  const scrollerFlows = flows.slice(0, 10)

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
          </div>

          {/* Content */}
          <div className="space-y-20">
            <div className="flex flex-col">
              <h3 className="text-lg font-semibold">Back a project</h3>
              <StartupsTable startups={startups} />
            </div>
            <div className="flex flex-col space-y-4">
              <h3 className="text-lg font-semibold">Get funded</h3>
              <OpportunitiesScroller opportunities={scrollerOpportunities} flows={scrollerFlows} />
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
