import Grid from "./grid"
import { AnimatedGrowthEvents } from "./animated-growth-events"
import { HeroContent } from "./hero-content"
import { type GrowthEvent } from "@/lib/onchain-startup/growth-events"

interface Props {
  totalEarned: number
  monthlyFlowRate: number
  totalBuilders: number
  growthEvents?: GrowthEvent[]
}

const Hero = async ({ totalEarned, monthlyFlowRate, totalBuilders, growthEvents = [] }: Props) => {
  return (
    <section className="relative flex min-h-[90vh] items-center overflow-hidden bg-gradient-to-b">
      <Grid />

      {/* Growth events animation */}
      <AnimatedGrowthEvents events={growthEvents} />

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
