import "server-only"

import { CastCard } from "@/components/ui/cast-card"
import { farcasterDb } from "@/lib/database/farcaster-edge"
import { getCacheStrategy } from "@/lib/database/edge"

async function getFlowsCasts() {
  try {
    const casts = await farcasterDb.cast.findMany({
      where: {
        computed_tags: { has: "nouns-flows" },
        deleted_at: null,
      },
      orderBy: { created_at: "desc" },
      take: 20,
      include: { profile: true },
      ...getCacheStrategy(600),
    })
    return casts
  } catch (error) {
    console.error("Error fetching flows casts:", error)
    return []
  }
}

export const FlowsUpdates = async () => {
  const casts = await getFlowsCasts()

  if (casts.length === 0) return null

  return (
    <section>
      <div className="flex items-center space-x-4">
        <h3 className="font-semibold leading-none tracking-tight md:text-lg">Updates</h3>
        <p className="translate-y-px text-sm text-muted-foreground">Latest news from builders</p>
      </div>

      <div className="mt-4 columns-1 gap-2.5 space-y-2.5 sm:columns-2 lg:columns-3 xl:columns-4">
        {casts.map((cast) => (
          <CastCard key={cast.hash.toString("hex")} cast={cast} />
        ))}
      </div>
    </section>
  )
}
