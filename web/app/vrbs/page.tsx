import "server-only"

import { AgentChatProvider } from "@/app/chat/components/agent-chat"
import { Submenu } from "@/components/global/submenu"
import { Button } from "@/components/ui/button"
import { getUserProfile } from "@/components/user-profile/get-user-profile"
import { getPrivyIdToken } from "@/lib/auth/get-user-from-cookie"
import { getUser } from "@/lib/auth/user"
import { getFlowWithGrants } from "@/lib/database/queries/flow"
import { getEthAddress } from "@/lib/utils"
import Image from "next/image"
import Link from "next/link"
import { GrantCard } from "../flow/[flowId]/components/grant-card"
// import { base } from "@/addresses"

// const flowId = base.VrbsFlowImpl
const flowId = "0xae37d62d313dba60efb068cdfe313f574983928e5a0297886359188234ba3fd7"

export default async function VrbsPage() {
  const { subgrants, ...flow } = await getFlowWithGrants(flowId)

  const user = await getUser()

  const grants = await Promise.all(
    subgrants
      .filter((g) => g.isActive)
      .map(async (g) => ({
        ...g,
        profile: await getUserProfile(getEthAddress(g.recipient)),
      })),
  )

  return (
    <AgentChatProvider
      id={`flow-${flow.id}-${user?.address}`}
      type="flo"
      user={user}
      data={{ flowId: flow.id }}
      identityToken={await getPrivyIdToken()}
    >
      <div className="container">
        <section className="relative isolate overflow-hidden rounded-2xl bg-primary/75 py-8 dark:bg-primary/25 lg:py-12">
          <Image
            src={"/vrbs-bg.jpg"}
            alt={flow.title}
            width="1500"
            height="500"
            priority
            className="pointer-events-none absolute inset-0 -z-10 size-full select-none object-cover opacity-50 mix-blend-multiply dark:opacity-30"
          />

          <div className="mx-auto max-w-7xl px-4 lg:px-6">
            <div className="max-w-2xl">
              <h2 className="text-4xl font-bold tracking-tighter text-white lg:text-5xl">
                Vrbs Accelerator
              </h2>
              <p className="mt-6 leading-7 text-white/80 lg:text-xl lg:leading-8">
                Get paid <strong>every second</strong> to bring your best ideas to life with Vrbs
                and make positive impact in the world.
              </p>
            </div>

            <div className="mt-8 lg:mt-10">
              <div className="flex flex-col max-md:gap-y-4 md:flex-row md:gap-x-12">
                {[
                  { name: "Check opportunities", href: `/vrbs/opportunities` },
                  { name: `Apply for a grant`, href: `/apply/${flowId}` },
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
                  { name: "Grants", value: grants.length },
                  { name: "Builders", value: grants.length },
                  { name: "Opportunities", value: 10 },
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
              {
                label: "Projects",
                href: `/vrbs`,
                isActive: true,
              },
              {
                label: "Applications",
                href: `/vrbs/applications`,
              },
            ]}
          />

          <div className="max-sm:hidden">
            <Link href={`/apply/${flowId}`}>
              <Button>Apply for funding</Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-3 xl:grid-cols-5">
          {grants.map((grant) => (
            <GrantCard key={grant.id} grant={grant} />
          ))}
        </div>
      </div>
    </AgentChatProvider>
  )
}
