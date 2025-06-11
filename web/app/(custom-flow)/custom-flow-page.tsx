import { AgentChatProvider } from "@/app/chat/components/agent-chat"
import GrantsList from "@/components/global/grants-list"
import { EmptyState } from "@/components/ui/empty-state"
import { getUserProfile } from "@/components/user-profile/get-user-profile"
import { getPrivyIdToken } from "@/lib/auth/get-user-from-cookie"
import { getUser } from "@/lib/auth/user"
import { getFlowWithGrants } from "@/lib/database/queries/flow"
import { sortGrants } from "@/lib/grant-utils"
import { getEthAddress } from "@/lib/utils"
import { AllocationProvider } from "@/lib/allocation/allocation-context"
import Image from "next/image"
import { base } from "viem/chains"
import { FlowSubmenu } from "../flow/[flowId]/components/flow-submenu"
import { CustomFlow } from "./custom-flows"

interface Props {
  customFlow: CustomFlow
}

export async function CustomFlowPage(props: Props) {
  const { customFlow } = props
  const { flowId } = customFlow

  const user = await getUser()
  const { subgrants, ...flow } = await getFlowWithGrants(flowId)

  const grants = await Promise.all(
    subgrants
      .filter((g) => g.isActive)
      .map(async (g) => ({
        ...g,
        profile: await getUserProfile(getEthAddress(g.allocator || g.recipient)),
      })),
  )

  const stats = [
    { name: "Projects", value: grants.length },
    {
      name: "Distributed so far",
      value: Intl.NumberFormat("en", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }).format(Number(flow.totalEarned)),
    },
    {
      name: "Monthly support",
      value: Intl.NumberFormat("en", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }).format(Number(flow.monthlyOutgoingFlowRate)),
    },
  ]

  return (
    <AllocationProvider
      chainId={base.id}
      contract={getEthAddress(flow.recipient)}
      votingToken={flow.erc721VotingToken}
      allocator={flow.allocator}
      strategies={flow.allocationStrategies}
    >
      <AgentChatProvider
        id={`flow-${flow.id}-${user?.address}`}
        type="flo"
        user={user}
        data={{ flowId: flow.id }}
        identityToken={await getPrivyIdToken()}
      >
        <div className="relative flex flex-col bg-muted md:max-h-[420px] md:flex-row">
          <div className="container max-w-6xl">
            <div className="relative z-10 lg:max-w-2xl">
              <svg
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                aria-hidden="true"
                className="absolute inset-y-0 right-8 hidden h-full w-80 translate-x-1/2 fill-muted lg:block"
              >
                <polygon points="0,0 90,0 50,100 0,100" />
              </svg>

              <div className="flex items-center py-8 md:h-full md:py-16">
                <div className="relative max-w-xl">
                  <h1 className="text-4xl font-semibold tracking-tighter lg:text-6xl">
                    {flow.title}
                  </h1>
                  <p className="mt-6 text-balance text-base text-muted-foreground sm:text-lg/7">
                    {flow.description}
                  </p>

                  <dl className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3">
                    {stats.map((stat) => (
                      <div key={stat.name} className="flex flex-col-reverse gap-1">
                        <dt className="text-xs text-muted-foreground md:text-sm">{stat.name}</dt>
                        <dd className="text-xl font-medium tracking-tight text-muted-foreground lg:text-2xl">
                          {stat.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-muted max-sm:order-first md:h-full lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
            <Image
              src={customFlow.coverImage}
              alt={flow.title}
              width="744"
              height="356"
              priority
              className="aspect-[2/1] object-cover lg:aspect-auto lg:size-full"
            />
          </div>
        </div>

        <div className="container max-w-6xl pb-24">
          <FlowSubmenu flowId={flowId} segment="approved" />
          {!subgrants || subgrants.length === 0 ? (
            <EmptyState
              title="No projects found"
              description="There are no approved projects yet"
            />
          ) : (
            <GrantsList flow={flow} grants={grants.sort(sortGrants)} />
          )}
        </div>
      </AgentChatProvider>
    </AllocationProvider>
  )
}
