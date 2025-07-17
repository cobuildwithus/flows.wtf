import Globe from "./globe"
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
      {/* Globe positioned on the right side */}
      <Globe className="pointer-events-auto absolute right-0 top-1/2 z-20 h-full w-1/2 translate-x-1/4 scale-[1.5] md:-translate-y-1/4 lg:w-[45%] lg:translate-x-1/3 lg:scale-[2]" />

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
