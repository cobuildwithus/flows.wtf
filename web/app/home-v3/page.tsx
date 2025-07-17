import { getUser } from "@/lib/auth/user"
import Footer from "@/components/global/footer"
import Hero from "./hero"
import { LiveOpportunities } from "./live-opportunities"
import { Suspense } from "react"
import { getPrivyIdToken } from "@/lib/auth/get-user-from-cookie"
import { getHeroStats } from "@/lib/home-v3/hero-data"
import ActivityFeed from "./activity-feed"
import { SkeletonLoader } from "@/components/ui/skeleton"

export default async function Home() {
  const [heroStats, user, privyIdToken] = await Promise.all([
    getHeroStats(),
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

      <div className="container mt-12 space-y-12">
        <Suspense fallback={<SkeletonLoader count={6} height={280} />}>
          <LiveOpportunities user={user} privyIdToken={privyIdToken} />
        </Suspense>

        <Suspense fallback={<SkeletonLoader count={8} height={72} />}>
          <ActivityFeed />
        </Suspense>
      </div>

      <div className="pt-12">
        <Footer />
      </div>
    </main>
  )
}
