import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import database from "@/lib/database/edge"
import { getPool } from "@/lib/database/queries/pool"
import { cn, getIpfsUrl } from "@/lib/utils"
import { Metadata } from "next"
import { unstable_cache } from "next/cache"
import Image from "next/image"
import Link from "next/link"

interface Props {
  searchParams: Promise<{ flowId: string }>
}

export const metadata: Metadata = {
  title: "Impact",
  description: "Explore the monthly impact and progress of grants.",
}

export default async function ImpactPage(props: Props) {
  const { flowId } = await props.searchParams
  const pool = await getPool()

  const flows = await unstable_cache(
    async () => {
      return database.grant.findMany({
        where: { isFlow: true, isActive: true, isTopLevel: false, flowId: pool.id },
        select: {
          id: true,
          title: true,
          image: true,
          derivedData: { select: { impactMonthly: true } },
        },
        orderBy: [{ activeRecipientCount: "desc" }],
      })
    },
    ["flows-for-impact"],
    { revalidate: 3600 },
  )()

  const flow = flows.find((flow) => flow.id === flowId) || flows[0]

  const grants = await unstable_cache(
    async () => database.grant.findMany({ where: { flowId: flow.id } }),
    ["grants-for-flow", flow.id],
    { revalidate: 3600 },
  )()

  const impacts = await database.impact.findMany({
    select: { id: true, bestImage: true, date: true, grantId: true },
    where: { grantId: { in: grants.map((g) => g.id) } },
    orderBy: [{ date: "desc" }],
  })

  return (
    <main>
      <div className="container relative my-6 grid grid-cols-1 items-start gap-y-10 md:grid-cols-4 md:gap-x-10">
        <div className="grid grid-cols-5 items-start gap-4 md:sticky md:top-8 md:grid-cols-3 md:gap-5">
          <h3 className="col-span-full text-xs uppercase tracking-wider text-muted-foreground">
            Choose a flow
          </h3>
          {flows.map((f) => (
            <Link
              href={`/impact?flowId=${f.id}`}
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
            Explore the monthly impact and progress of {grants.length} grants in this flow.
          </p>
          <div className="relative mt-6 flex flex-col">
            <div className="absolute bottom-0 left-4 top-0 w-px bg-border" />

            {flow.derivedData?.impactMonthly?.reverse().map((impact) => (
              <div key={impact.date} className="relative mb-16 pl-12">
                <div className="absolute left-2 top-2 size-4 rounded-full border-2 bg-primary" />

                <div className="flex flex-col gap-4">
                  <h3 className="text-base font-medium md:text-lg">
                    {new Date(`${impact.date}-01`).toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}
                  </h3>
                  <p className="text-pretty text-sm leading-relaxed opacity-75 md:text-base">
                    {impact.summary}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2.5">
                    {impacts
                      .filter((i) => i.date.toISOString().substring(0, 7) === impact.date)
                      .slice(0, 14)
                      .map((i) => (
                        <Link href={`/item/${i.grantId}`} key={`${i.bestImage.url}-${i.id}`}>
                          <Image
                            src={i.bestImage.url}
                            alt={flow.title}
                            width={80}
                            height={80}
                            className="aspect-video w-20 rounded-lg object-cover md:w-32"
                          />
                        </Link>
                      ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
