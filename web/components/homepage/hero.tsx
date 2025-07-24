import Grid from "./grid"
import { AnimatedGrowthEvents } from "./animated-growth-events"
import { HeroContent } from "./hero-content"
import { getGrowthEvents } from "@/lib/onchain-startup/growth-events"
import { Suspense } from "react"

interface Props {
  totalEarned: number
  monthlyFlowRate: number
  totalBuilders: number
}

const Hero = async ({ totalEarned, monthlyFlowRate, totalBuilders }: Props) => {
  return (
    <section className="relative flex min-h-[90vh] items-center overflow-hidden bg-gradient-to-b">
      <Grid />

      {/* Growth events animation */}
      <Suspense>
        <AnimatedGrowthEvents events={await getGrowthEvents()} />
      </Suspense>

      <div className="container relative z-30 mx-auto px-4 py-20">
        <HeroContent
          totalEarned={totalEarned}
          monthlyFlowRate={monthlyFlowRate}
          totalBuilders={totalBuilders}
        />
      </div>
    </section>
  )
}

export default Hero
