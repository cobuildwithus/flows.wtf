import { getUser } from "@/lib/auth/user"
import database from "@/lib/database/flows-db"
import { getPool } from "@/lib/database/queries/pool"
import { getEthAddress } from "@/lib/utils"
import { AllocationProvider } from "@/lib/allocation/allocation-context"
import Link from "next/link"
import FlowsList from "./components/flows-list"
import type { LimitedFlow } from "./components/flows-table"
import { HomepageIntro } from "./components/homepage-intro"
import { CTAButtons } from "./flow/[flowId]/components/cta-buttons"
import { AllocationBar } from "@/components/global/allocation-bar"
import Footer from "@/components/global/footer"

export default async function Home() {
  const pool = await getPool()
  const [activeFlows, user] = await Promise.all([
    database.grant.findMany({
      // just nouns flows for now
      where: { isFlow: true, isActive: true, isTopLevel: false, flowId: pool.id },
      omit: { description: true },
      orderBy: [
        { activeRecipientCount: "desc" },
        { challengedRecipientCount: "desc" },
        { awaitingRecipientCount: "desc" },
      ],
    }),
    getUser(),
  ])

  return (
    <AllocationProvider
      chainId={pool.chainId}
      contract={getEthAddress(pool.recipient)}
      strategies={pool.allocationStrategies}
      user={user?.address ?? null}
    >
      <main>
        <div className="container mt-6">
          <HomepageIntro user={user} />
        </div>
        <div className="container mt-6 flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-4">
              <h3 className="text-lg font-semibold leading-none tracking-tight md:text-xl">
                <Link href={`/flow/${pool.id}`} className="hover:text-primary">
                  Explore Flows
                </Link>
              </h3>
            </div>
          </div>

          <CTAButtons />
        </div>

        <div className="container my-6">
          <FlowsList flows={activeFlows} />
        </div>
        <div className="pt-12">
          <Footer />
        </div>
      </main>
      <AllocationBar />
    </AllocationProvider>
  )
}

function getSum(flows: LimitedFlow[], key: keyof LimitedFlow): number {
  return flows.reduce((sum, flow) => sum + (flow[key] as number), 0)
}
