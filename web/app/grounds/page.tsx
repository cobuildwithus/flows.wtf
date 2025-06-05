import "server-only"

import { getFlowWithGrants } from "@/lib/database/queries/flow"
import { getStartups } from "@/lib/onchain-startup/startup"
import { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { getUserProfile } from "@/components/user-profile/get-user-profile"
import { getAddress } from "viem"
import { EmptyState } from "@/components/ui/empty-state"
import { FlowSubmenu } from "../flow/[flowId]/components/flow-submenu"
import { AllocationBar } from "@/components/global/allocation-bar"
import GrantsList from "@/components/global/grants-list"
import { sortGrants } from "@/lib/grant-utils"
import { base } from "viem/chains"
import { AllocationProvider } from "@/lib/voting/allocation-context"

const flowId = "0xca1d9e8a93f316ef7e6f880116a160333d085f92"

export const metadata: Metadata = {
  title: "Grounds Flow",
  description:
    "Wake up! Be bold and fund good people. We fund innovative coffee projects, with a rich blend of builders and communities.",
}

export default async function VrbsPage() {
  const startups = getStartups("vrbs")

  const { subgrants, ...flow } = await getFlowWithGrants(flowId)

  const grants = await Promise.all(
    subgrants
      .filter((g) => g.isActive)
      .map(async (g) => ({
        ...g,
        profile: await getUserProfile(getAddress(g.allocator || g.recipient)),
      })),
  )

  return (
    <AllocationProvider
      chainId={base.id}
      contract={getAddress(flow.recipient)}
      votingToken={flow.erc721VotingToken}
      allocator={flow.allocator}
    >
      <div>
        <div className="container">
          <section className="relative isolate overflow-hidden rounded-2xl py-8 lg:py-12">
            <Image
              src={"/grounds-bg.png"}
              alt={flow.title}
              width="1500"
              height="500"
              priority
              className="pointer-events-none absolute inset-0 -z-10 size-full select-none object-cover opacity-50 mix-blend-multiply blur-[3px]"
            />

            <div className="mx-auto max-w-7xl px-4 lg:px-6">
              <div className="max-w-2xl">
                <h2 className="text-4xl font-bold tracking-tighter text-white lg:text-5xl">
                  Grounds Flow
                </h2>
                <p className="mt-6 leading-7 text-white/80 lg:text-xl lg:leading-8">
                  Wake up! We fund innovative coffee projects, with a rich blend of builders and
                  communities.
                </p>
              </div>

              <div className="mt-8 lg:mt-10">
                <div className="flex flex-col max-md:gap-y-4 md:flex-row md:gap-x-12">
                  {[{ name: `Apply for funding`, href: `/apply/${flowId}` }].map((link) => (
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
          <FlowSubmenu flowId={flowId} segment="approved" />
          {!subgrants || subgrants.length === 0 ? (
            <EmptyState title="No grants found" description="There are no approved grants yet" />
          ) : (
            <GrantsList flow={flow} grants={grants.sort(sortGrants)} />
          )}
        </div>

        <AllocationBar />
      </div>
    </AllocationProvider>
  )
}
