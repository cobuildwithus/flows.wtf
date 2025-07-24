import { getUser } from "@/lib/auth/user"
import Footer from "@/components/global/footer"
import Hero from "./hero"
import { LiveOpportunities } from "./live-opportunities"
import { Suspense } from "react"
import { getPrivyIdToken } from "@/lib/auth/get-user-from-cookie"
import { getHeroStats } from "@/lib/home-v3/hero-data"
import ActivityFeed from "./activity-feed"
import TopHolders from "./top-holders"
import { SkeletonLoader } from "@/components/ui/skeleton"
import { TrustedBySection } from "./trusted-by-section"
import { getTopLevelFlows } from "@/lib/database/queries/get-top-level-flows"

export default async function Home() {
  const [heroStats, user, privyIdToken, topLevelFlows] = await Promise.all([
    getHeroStats(),
    getUser(),
    getPrivyIdToken(),
    getTopLevelFlows(),
  ])

  return (
    <main>
      <Hero
        totalEarned={heroStats.totalEarned}
        monthlyFlowRate={heroStats.totalMonthlyFlowRate}
        totalBuilders={heroStats.totalBuilders}
        growthEvents={heroStats.growthEvents.slice(0, 20)}
      />

      <TrustedBySection topLevelFlows={topLevelFlows} />

      <div className="container space-y-12">
        <Suspense fallback={<SkeletonLoader count={6} height={280} />}>
          <LiveOpportunities user={user} privyIdToken={privyIdToken} />
        </Suspense>

        <section className="py-16">
          <h2 className="mb-6 text-4xl font-semibold md:text-5xl">Builders and backers</h2>
          <p className="mb-8 text-muted-foreground">See who&apos;s building and backing projects</p>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Suspense fallback={<SkeletonLoader count={20} height={80} />}>
              <div className="lg:col-span-2">
                <TopHolders />
              </div>
            </Suspense>
            <Suspense fallback={<SkeletonLoader count={8} height={72} />}>
              <div className="lg:col-span-1">
                <h3 className="text-xl font-semibold">Recent activity</h3>
                <ActivityFeed />
              </div>
            </Suspense>
          </div>
        </section>
      </div>

      <div className="pt-12">
        <Footer />
      </div>
    </main>
  )
}
