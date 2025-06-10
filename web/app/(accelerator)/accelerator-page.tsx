import { AgentChatProvider } from "@/app/chat/components/agent-chat"
import { EthInUsd } from "@/components/global/eth-in-usd"
import { Submenu } from "@/components/global/submenu"
import { Button } from "@/components/ui/button"
import { getPrivyIdToken } from "@/lib/auth/get-user-from-cookie"
import { getUser } from "@/lib/auth/user"
import database from "@/lib/database/flows-db"
import { getFlow } from "@/lib/database/queries/flow"
import { Accelerator } from "@/lib/onchain-startup/data/accelerators"
import { getStartups } from "@/lib/onchain-startup/startup"
import Image from "next/image"
import Link from "next/link"

interface Props {
  accelerator: Accelerator
}

export async function AcceleratorPage(props: Props) {
  const { accelerator } = props

  const startups = getStartups(accelerator)

  const [flow, user, opportunitiesCount, balances, participants] = await Promise.all([
    getFlow(accelerator.flowId),
    getUser(),
    database.opportunity.count({
      where: { status: 1, startupId: { in: startups.map((s) => s.id) } },
    }),
    database.juiceboxProject.groupBy({
      by: ["projectId"],
      where: { projectId: { in: startups.map((s) => s.revnetProjectId) } },
      _sum: { balance: true },
    }),
    database.juiceboxParticipant.findMany({
      where: {
        projectId: { in: startups.map((s) => s.revnetProjectId) },
        balance: { gt: 0 },
      },
      select: { projectId: true, address: true },
      distinct: ["projectId", "address"],
    }),
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
            className="pointer-events-none absolute inset-0 -z-10 size-full select-none object-cover opacity-70 mix-blend-multiply grayscale"
          />

          <div className="mx-auto max-w-7xl px-4 lg:px-6">
            <div className="max-w-3xl">
              <h2 className="text-balance text-4xl font-bold tracking-tighter text-white lg:text-5xl">
                {flow.title}
              </h2>
              <p className="mt-6 text-pretty leading-7 text-white/80 lg:text-xl lg:leading-8">
                {flow.description}
              </p>
            </div>

            <div className="mt-8 lg:mt-10">
              <div className="flex flex-col max-md:gap-y-4 md:flex-row md:gap-x-12">
                {[
                  { name: "Check opportunities", href: `/opportunities` },
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
              <dl className="mt-12 grid grid-cols-2 items-start gap-8 lg:max-w-3xl lg:grid-cols-4">
                {[
                  { name: "Projects", value: startups.length },
                  { name: "Opportunities", value: opportunitiesCount },
                  {
                    name: "Earned so far",
                    value: Intl.NumberFormat("en", {
                      style: "currency",
                      currency: "USD",
                      maximumFractionDigits: 0,
                    }).format(Number(flow.totalEarned)),
                  },
                ].map((stat) => (
                  <div key={stat.name} className="flex flex-col-reverse gap-1">
                    <dt className="text-sm leading-7 text-white/80 md:text-base">{stat.name}</dt>
                    <dd className="text-2xl font-medium tracking-tight text-white lg:text-3xl">
                      {stat.value}
                    </dd>
                  </div>
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
              // { label: "Applications", href: `/flow/${accelerator.flowId}/applications` },
            ]}
          />

          <div className="max-sm:hidden">
            <Link href={`/apply/${accelerator.flowId}`}>
              <Button style={{ backgroundColor: accelerator.color }} className="text-white">
                Apply for funding
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {startups.map((startup) => (
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
                href={`/dashboard/${startup.id}`}
                className="relative flex h-full flex-col justify-end overflow-hidden p-5"
              >
                <div className="space-y-4">
                  <div>
                    <h3 className="text-balance text-lg font-semibold tracking-tight text-card-foreground">
                      {startup.title}
                    </h3>
                    <p className="mt-1 text-pretty text-sm leading-relaxed tracking-tight text-card-foreground/80">
                      {startup.tagline}
                    </p>
                  </div>

                  <div className="border-t pt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-card-foreground/80">Treasury</p>
                        <p className="mt-1 text-sm font-semibold text-card-foreground">
                          <EthInUsd
                            amount={BigInt(
                              balances
                                .find((p) => p.projectId === startup.revnetProjectId)
                                ?._sum.balance?.toNumber() ?? 0,
                            )}
                          />
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-card-foreground/80">Supporters</p>
                        <p className="mt-1 text-sm font-semibold text-card-foreground">
                          {
                            participants.filter((p) => p.projectId === startup.revnetProjectId)
                              .length
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </AgentChatProvider>
  )
}
