import { Suspense } from "react"
import ActivityFeed from "./activity-feed"
import { SkeletonLoader } from "@/components/ui/skeleton"

export function BuildersAndBackers() {
  return (
    <section className="w-full bg-primary/5 py-16">
      <div className="container">
        <div className="mb-8 flex flex-col space-y-3">
          <h2 className="text-4xl font-semibold md:text-6xl">Builders & backers</h2>
        </div>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-6">
          <Suspense fallback={<SkeletonLoader count={8} height={72} />}>
            <ActivityFeed />
          </Suspense>
        </div>
      </div>
    </section>
  )
}
