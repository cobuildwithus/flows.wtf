import Globe from "./globe"
import { AnimatedTokenPayments } from "./animated-token-payments"
import { TokenPayment } from "@/lib/onchain-startup/token-payments"
import { HeroContent } from "./hero-content"
import { getUserProfile } from "@/components/user-profile/get-user-profile"

interface ExtendedTokenPayment extends TokenPayment {
  startup: {
    name: string
    slug: string
  }
}

interface Props {
  totalEarned: number
  monthlyFlowRate: number
  tokenPayments?: ExtendedTokenPayment[]
}

const Hero = async ({ totalEarned, monthlyFlowRate, tokenPayments = [] }: Props) => {
  // Fetch profiles server-side
  const uniqueAddresses = Array.from(new Set(tokenPayments.map((p) => p.beneficiary)))
  const profiles = await Promise.all(
    uniqueAddresses.map(async (address) => {
      const profile = await getUserProfile(address as `0x${string}`)
      return [address, profile] as const
    }),
  )
  const profilesMap = Object.fromEntries(profiles)

  return (
    <section className="relative flex min-h-[90vh] items-center overflow-hidden bg-gradient-to-b">
      {/* Globe positioned on the right side */}
      <Globe className="pointer-events-auto absolute right-0 top-1/2 z-20 h-full w-1/2 translate-x-1/4 scale-[1.5] md:-translate-y-1/4 lg:w-[45%] lg:translate-x-1/3 lg:scale-[2]" />

      {/* Token payments animation */}
      <AnimatedTokenPayments payments={tokenPayments} profiles={profilesMap} />

      <div className="container relative z-30 mx-auto px-4 py-20">
        <div>
          {/* Left side - Content */}
          <HeroContent totalEarned={totalEarned} monthlyFlowRate={monthlyFlowRate} />

          {/* Right side - Visual */}
        </div>
      </div>
    </section>
  )
}

export default Hero
