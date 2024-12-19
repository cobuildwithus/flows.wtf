import database, { getCacheStrategy } from "@/lib/database/edge"
import { getPool } from "@/lib/database/queries/pool"
import { FullDiagram } from "./diagram"
import { Metadata } from "next"

export const runtime = "nodejs"

export async function generateMetadata(): Promise<Metadata> {
  const pool = await getPool()
  return {
    title: `Explore - ${pool.title}`,
    description: `Diagram of all flows in ${pool.title} `,
  }
}

export default async function ExplorePage() {
  const [flows, pool] = await Promise.all([
    database.grant.findMany({
      where: { isActive: true, isFlow: true, isTopLevel: false },
      include: { subgrants: { where: { isActive: true } } },
      ...getCacheStrategy(3600),
    }),
    getPool(),
  ])

  return (
    <main className="flex grow flex-col">
      <FullDiagram flows={flows} pool={pool} />
    </main>
  )
}
