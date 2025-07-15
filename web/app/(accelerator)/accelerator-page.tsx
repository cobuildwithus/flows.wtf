import { AgentChatProvider } from "@/app/chat/components/agent-chat"
import { FundFlow } from "@/components/fund-flow/fund-flow"
import { Submenu } from "@/components/global/submenu"
import { Button } from "@/components/ui/button"
import { getPrivyIdToken } from "@/lib/auth/get-user-from-cookie"
import { getUser } from "@/lib/auth/user"
import { getFlow } from "@/lib/database/queries/flow"
import { Accelerator } from "@/lib/onchain-startup/data/accelerators"
import { getStartups } from "@/lib/onchain-startup/startup"
import Image from "next/image"
import Link from "next/link"
import { getTotalRevenue } from "@/lib/onchain-startup/get-total-revenue"
import { PercentChange } from "@/components/ui/percent-change"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

interface Props {
  accelerator: Accelerator
}

export async function AcceleratorPage(props: Props) {
  const { accelerator } = props

  const startups = getStartups(accelerator)
  const [flow, user, revenue] = await Promise.all([
    getFlow(accelerator.flowId),
    getUser(),
    getTotalRevenue(startups),
  ])

  return (
    <AgentChatProvider
      id={`flow-${flow.id}-${user?.address}`}
      type="flo"
      user={user}
      data={{ flowId: flow.id }}
      identityToken={await getPrivyIdToken()}
    >
      <div className="container">
        <section
          style={{ backgroundColor: accelerator.color }}
          className="relative isolate overflow-hidden rounded-2xl py-8 lg:py-12"
        >
          <Image
            src={accelerator.coverImage}
            alt={flow.title}
            width="1500"
            height="500"
            priority
            className="pointer-events-none absolute inset-0 -z-10 size-full select-none object-cover opacity-70 mix-blend-multiply blur-[6px] grayscale"
          />

          <div className="mx-auto max-w-7xl px-4 lg:px-6">
            <div className="max-w-3xl">
              <h2 className="text-balance text-4xl font-bold tracking-tighter text-white lg:text-5xl">
                {flow.title}
              </h2>
              <p className="mt-6 text-pretty leading-7 text-white/80 lg:text-xl lg:leading-8">
                {flow.tagline}
              </p>
            </div>

            <div className="mt-8 lg:mt-10">
              <div className="flex flex-col max-md:gap-y-4 md:flex-row md:gap-x-12">
                {[
                  { name: "Get hired", href: `/apply` },
                  { name: `Apply for funding`, href: `/apply/${accelerator.flowId}` },
                ].map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="font-semibold leading-7 text-white underline-offset-4 hover:underline"
                  >
                    {link.name} <span aria-hidden="true">&rarr;</span>
                  </Link>
                ))}
              </div>
              <dl className="mt-12 grid grid-cols-1 items-start gap-8 md:grid-cols-2 lg:max-w-3xl lg:grid-cols-4">
                {[
                  {
                    name: "in revenue",
                    value: Intl.NumberFormat("en", {
                      style: "currency",
                      currency: "USD",
                      maximumFractionDigits: 0,
                    }).format(revenue.totalRevenue),
                    tooltip: "Revnet token purchases and Shopify sales",
                  },
                  {
                    name: "growth rate",
                    value: revenue.salesChange,
                    change: revenue.salesChange,
                    tooltip: "Month over month change in revenue",
                  },
                ].map((stat) => (
                  <Tooltip key={stat.name}>
                    <TooltipTrigger asChild>
                      <div className="relative flex cursor-help flex-col-reverse gap-1 overflow-hidden rounded-lg bg-white/10 p-4 backdrop-blur-sm">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-50" />
                        <dt className="relative text-sm leading-7 text-white/90 md:text-base">
                          {stat.name}
                        </dt>
                        <dd className="relative flex items-end gap-2 text-2xl font-medium tracking-tight text-white lg:text-3xl">
                          {stat.change !== undefined ? (
                            <PercentChange
                              value={stat.value}
                              className="text-2xl font-medium tracking-tight lg:text-3xl"
                              showColor={false}
                            />
                          ) : (
                            <span className="text-white">{stat.value}</span>
                          )}
                        </dd>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{stat.tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </dl>
            </div>
          </div>
        </section>
      </div>

      <div className="container pb-24">
        <div className="mb-4 mt-14 flex items-center justify-between md:mb-8">
          <Submenu
            links={[
              { label: "Projects", href: `/${accelerator.id}`, isActive: true },
              { label: "Applications", href: `/flow/${accelerator.flowId}/drafts` },
            ]}
          />

          <div className="flex flex-row space-x-2 max-sm:hidden">
            <FundFlow variant="ghost" flow={flow} />
            <Link href={`/apply/${accelerator.flowId}`}>
              <Button style={{ backgroundColor: accelerator.color }} className="text-white">
                Apply
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {startups.map((startup) => {
            const revenueData = revenue.revenueByProjectId.get(startup.id)

            return (
              <article
                className="group relative flex aspect-[3/4] w-full shrink-0 flex-col justify-end overflow-hidden rounded-xl border"
                key={`${startup.id}${startup.title}`}
              >
                <Image
                  alt={startup.title}
                  src={startup.image}
                  className="absolute inset-x-0 top-0 aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-110"
                  width={384}
                  height={384}
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 rounded-xl bg-gradient-to-t from-card from-25%"
                />

                <Link
                  href={`/startup/${startup.id}`}
                  className="relative flex h-full flex-col justify-end overflow-hidden p-5"
                >
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-balance text-lg font-semibold tracking-tight text-card-foreground">
                        {startup.title}
                      </h3>
                      <p className="mt-1 text-pretty text-sm leading-relaxed tracking-tight text-card-foreground/80">
                        {startup.shortMission}
                      </p>
                    </div>
                    <div className="border-t pt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-card-foreground/80">Revenue</p>
                          <p className="mt-1 text-sm font-semibold text-card-foreground">
                            {Intl.NumberFormat("en", {
                              style: "currency",
                              currency: "USD",
                              maximumFractionDigits: 0,
                            }).format(revenueData?.totalSales ?? 0)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-card-foreground/80">Growth rate</p>
                          <PercentChange
                            value={revenueData?.salesChange ?? 0}
                            className="mt-1 text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </article>
            )
          })}
        </div>
      </div>
    </AgentChatProvider>
  )
}
