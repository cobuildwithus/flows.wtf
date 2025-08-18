import { Suspense } from "react"
import TopHolders from "./top-holders"
import ActivityFeed from "./activity-feed"
import { SkeletonLoader } from "@/components/ui/skeleton"

export function BuildersAndBackers() {
  return (
    <section className="w-full bg-primary/5 py-16">
      <div className="container">
        <div className="mb-8 flex flex-col space-y-3">
          <h2 className="text-4xl font-semibold md:text-6xl">Builders & backers</h2>
        </div>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-5 lg:gap-6">
          <Suspense fallback={<SkeletonLoader count={20} height={80} />}>
            <TopHolders />
          </Suspense>
          <Suspense fallback={<SkeletonLoader count={8} height={72} />}>
            <div className="lg:col-span-2">
              <ActivityFeed />
            </div>
          </Suspense>
        </div>
      </div>
    </section>
  )
}
