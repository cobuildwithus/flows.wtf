import { getUser } from "@/lib/auth/user"
import Footer from "@/components/global/footer"
import Hero from "./hero"
import { LiveOpportunities } from "./live-opportunities"
import { getPrivyIdToken } from "@/lib/auth/get-user-from-cookie"
import { getHeroStats } from "@/lib/home-v3/hero-data"
import { getLiveOpportunitiesData } from "@/lib/home-v3/live-opportunities-data"
import { getStartupsTableData } from "@/lib/home-v3/startups-table-data"
import { ActivityFeed } from "./activity-feed"
import { getActivityFeedEvents } from "@/lib/home-v3/activity-feed-data"

export default async function Home() {
  const [heroStats, liveData, startupsTable, activityEvents, user, privyIdToken] =
    await Promise.all([
      getHeroStats(),
      getLiveOpportunitiesData(),
      getStartupsTableData(),
      getActivityFeedEvents(),
      getUser(),
      getPrivyIdToken(),
    ])

  return (
    <main>
      <Hero
        totalEarned={heroStats.totalEarned}
        monthlyFlowRate={heroStats.totalMonthlyFlowRate}
        totalBuilders={heroStats.totalBuilders}
        growthEvents={heroStats.growthEvents.slice(0, 20)}
      />

      <LiveOpportunities
        opportunities={liveData.opportunities}
        flows={liveData.flows}
        user={user}
        privyIdToken={privyIdToken}
        startups={startupsTable}
      />

      <ActivityFeed events={activityEvents} />

      <div className="pt-12">
        <Footer />
      </div>
    </main>
  )
}
