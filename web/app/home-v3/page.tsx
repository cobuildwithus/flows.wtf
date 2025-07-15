import { getUser } from "@/lib/auth/user"
import Footer from "@/components/global/footer"
import Hero from "./hero"
import database from "@/lib/database/flows-db"
import { getAllStartupsWithIds } from "@/lib/onchain-startup/startup"
import { getTotalRevenue } from "@/lib/onchain-startup/get-total-revenue"

const VRBS_GRANTS_PAYOUTS = 35555.41
const REWARD_POOL_PAYOUT = 7547.3

export default async function Home() {
  // Fetch grants data for Hero
  const grants = await database.grant.findMany({
    where: { isFlow: true },
    select: { totalEarned: true, monthlyOutgoingFlowRate: true, flowId: true, id: true },
  })

  // Fetch startup revenue data
  const startups = getAllStartupsWithIds()
  const revenue = await getTotalRevenue(startups)

  const totalMonthlyFlowRate = calculateTotalOutgoingFlowRate(grants)
  const totalEarned =
    grants.reduce((acc, grant) => acc + Number(grant.totalEarned), 0) +
    VRBS_GRANTS_PAYOUTS +
    REWARD_POOL_PAYOUT +
    revenue.totalRevenue

  return (
    <main>
      <Hero totalEarned={totalEarned} monthlyFlowRate={totalMonthlyFlowRate} />

      <div className="pt-12">
        <Footer />
      </div>
    </main>
  )
}

function calculateTotalOutgoingFlowRate(
  flows: Array<{ id: string; monthlyOutgoingFlowRate: string; flowId?: string }>,
): number {
  return flows
    .filter((flow) => !flows.some((otherFlow) => otherFlow.flowId === flow.id))
    .reduce((total, flow) => {
      const flowRate = parseFloat(flow.monthlyOutgoingFlowRate)
      return total + (isNaN(flowRate) ? 0 : flowRate)
    }, 0)
}
