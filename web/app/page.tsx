import { getUser } from "@/lib/auth/user"
import Footer from "@/components/global/footer"
import Hero from "../components/homepage/hero"
import { LiveOpportunities } from "../components/homepage/live-opportunities"
import { Suspense } from "react"
import { getPrivyIdToken } from "@/lib/auth/get-user-from-cookie"
import { getHeroStats } from "@/lib/homepage/hero-data"
import { BuildersAndBackers } from "../components/homepage/builders-and-backers"
import { TrustedBySection } from "../components/homepage/trusted-by-section"
import { getTopLevelFlows } from "@/lib/database/queries/get-top-level-flows"
import { FinalSell } from "../components/homepage/final-sell"
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
      />
      {/* 
      <Suspense>
        <TrustedBySection topLevelFlows={await getTopLevelFlows()} />
      </Suspense> */}

      <div className="container space-y-12">
        <Suspense fallback={<SkeletonLoader count={6} height={280} />}>
          <LiveOpportunities user={user} privyIdToken={privyIdToken} />
        </Suspense>
      </div>

      <BuildersAndBackers />

      <FinalSell />

      <Suspense>
        <Footer />
      </Suspense>
    </main>
  )
}
