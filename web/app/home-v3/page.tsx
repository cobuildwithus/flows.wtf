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
          <div className="mb-8 flex flex-col space-y-3">
            <h2 className="text-4xl font-semibold md:text-5xl">Builders & backers</h2>
            <p className="text-muted-foreground">See who&apos;s building and backing projects</p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Suspense fallback={<SkeletonLoader count={20} height={80} />}>
              <div className="lg:col-span-2">
                <h3 className="mb-3 text-lg font-semibold">Top backers</h3>
                <TopHolders />
              </div>
            </Suspense>
            <Suspense fallback={<SkeletonLoader count={8} height={72} />}>
              <div className="flex flex-col space-y-5 md:space-y-0 lg:col-span-1">
                <h3 className="text-lg font-semibold">Recent activity</h3>
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
