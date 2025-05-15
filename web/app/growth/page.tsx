import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import database from "@/lib/database/edge"
import { getPool } from "@/lib/database/queries/pool"
import { cn, getIpfsUrl } from "@/lib/utils"
import { Metadata } from "next"
import { unstable_cache } from "next/cache"
import Image from "next/image"
import Link from "next/link"
import { Suspense } from "react"
import RejectedGrantsSection from "@/components/global/growth/rejected-grants-section"
import RemovedGrantsSection from "@/components/global/growth/removed-grants-section"
import { GrowthStats } from "./components/GrowthStats"
import TopLevelPerformanceSection from "@/components/global/growth/top-level-performance-section"

interface Props {
  searchParams: Promise<{ flowId: string }>
}

export const metadata: Metadata = {
  title: "Growth",
  description: "Explore statistics and growth for Flows.",
}

export default async function GrowthPage(props: Props) {
  const { flowId } = await props.searchParams

  const pool = await getPool()

  const flows = await unstable_cache(
    async () => {
      return database.grant.findMany({
        where: {
          OR: [{ flowId: pool.id }, { id: pool.id }],
        },
        omit: { description: true },
        orderBy: [{ isTopLevel: "desc" }, { activeRecipientCount: "desc" }],
      })
    },
    ["flows-for-growth"],
    { revalidate: 3600 },
  )()

  const flow = flows.find((flow) => flow.id === flowId) || pool
  const topLevelRecipientCount = flows
    .filter((f) => !f.isTopLevel && !f.isRemoved)
    .reduce((acc, flow) => acc + flow.activeRecipientCount, 0)

  const topLevelPaidOut = flows.reduce((acc, grant) => acc + Number(grant.totalEarned), 0)

  return (
    <main>
      <div className="container relative my-6 grid grid-cols-1 items-start gap-y-10 md:grid-cols-4 md:gap-x-10">
        <div className="grid grid-cols-5 items-start gap-4 md:sticky md:top-8 md:grid-cols-3 md:gap-5">
          <h3 className="col-span-full text-xs uppercase tracking-wider text-muted-foreground">
            Choose a flow
          </h3>
          {flows.map((f) => (
            <Link
              href={`/growth?flowId=${f.id}`}
              className="group flex aspect-square flex-col items-center gap-2.5"
              key={f.id}
            >
              <Tooltip>
                <TooltipTrigger>
                  <Image
                    alt={f.title}
                    src={getIpfsUrl(f.image)}
                    className={cn("aspect-square w-full rounded-full object-cover", {
                      "shadow-md shadow-primary ring-4 ring-primary": f.id === flow.id,
                    })}
                    width={96}
                    height={96}
                  />
                </TooltipTrigger>
                <TooltipContent>{f.title}</TooltipContent>
              </Tooltip>
            </Link>
          ))}
        </div>
        <div className="col-span-3 flex flex-col gap-2">
          <Link href={`/flow/${flow.id}`} className="text-xl font-medium">
            {flow.title}
          </Link>
          <p className="text-sm/relaxed opacity-75">
            {flow.isTopLevel ? (
              <>
                Explore stats for <strong>all flows</strong>.
              </>
            ) : (
              "Explore stats for this flow."
            )}
          </p>
          <div className="relative flex flex-col">
            <Suspense>
              <GrowthStats
                topLevelRecipientCount={topLevelRecipientCount}
                flow={flow}
                className="mt-4"
              />
            </Suspense>
            {flow.isTopLevel ? (
              <Suspense>
                <TopLevelPerformanceSection className="mt-12" topLevelPaidOut={topLevelPaidOut} />
              </Suspense>
            ) : (
              <Suspense>
                <RemovedGrantsSection defaultOpen flow={flow} className="mt-12" />
              </Suspense>
            )}
            <Suspense>
              <RejectedGrantsSection
                topLevelRecipientCount={topLevelRecipientCount}
                flow={flow}
                className="mt-12"
                defaultOpen
              />
            </Suspense>
          </div>
        </div>
      </div>
    </main>
  )
}
