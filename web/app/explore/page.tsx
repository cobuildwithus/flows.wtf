import database from "@/lib/database/flows-db"
import { getPool } from "@/lib/database/queries/pool"
import { FullDiagram } from "./diagram"
import type { Metadata } from "next"

export async function generateMetadata(): Promise<Metadata> {
  const pool = await getPool()
  return {
    title: `Explore - ${pool.title}`,
    description: `Diagram of all flows in ${pool.title} `,
  }
}

export default async function ExplorePage() {
  const pool = await getPool()
  const flows = await database.grant.findMany({
    where: { isActive: true, isFlow: true, isTopLevel: false, flowId: pool.id },
    select: {
      id: true,
      title: true,
      image: true,
      monthlyIncomingFlowRate: true,
      monthlyOutgoingFlowRate: true,
      subgrants: {
        where: { isActive: true },
        select: {
          id: true,
          title: true,
          image: true,
        },
      },
    },
  })

  return (
    <main className="flex grow flex-col">
      <FullDiagram flows={flows} pool={pool} />
    </main>
  )
}
