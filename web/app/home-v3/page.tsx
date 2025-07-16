import { getUser } from "@/lib/auth/user"
import Footer from "@/components/global/footer"
import Hero from "./hero"
import database from "@/lib/database/flows-db"
import { getAllStartupsWithIds } from "@/lib/onchain-startup/startup"
import { getTotalRevenue } from "@/lib/onchain-startup/get-total-revenue"
import { getTokenPayments } from "@/lib/onchain-startup/token-payments"

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

  // Fetch token payments for all startups with startup info
  const tokenPayments = await fetchAndSortTokenPayments(startups)

  const totalMonthlyFlowRate = calculateTotalOutgoingFlowRate(grants)
  const totalEarned =
    grants.reduce((acc, grant) => acc + Number(grant.totalEarned), 0) +
    VRBS_GRANTS_PAYOUTS +
    REWARD_POOL_PAYOUT +
    revenue.totalRevenue

  return (
    <main>
      <Hero
        totalEarned={totalEarned}
        monthlyFlowRate={totalMonthlyFlowRate}
        tokenPayments={tokenPayments.slice(0, 20)} // Only pass recent 20 payments
      />

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

async function fetchAndSortTokenPayments(startups: ReturnType<typeof getAllStartupsWithIds>) {
  // Fetch token payments for all startups with startup info
  const allTokenPayments = await Promise.all(
    startups.map(async (startup) => {
      const payments = await getTokenPayments(Number(startup.revnetProjectIds.base))
      return payments.map((payment) => ({
        ...payment,
        startup: {
          name: startup.title,
          slug: startup.slug,
        },
      }))
    }),
  )

  // Flatten and sort all payments by timestamp
  return allTokenPayments
    .flat()
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}
