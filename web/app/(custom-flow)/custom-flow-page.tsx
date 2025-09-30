import GrantsList from "@/components/global/grants-list"
import { EmptyState } from "@/components/ui/empty-state"
import { getUserProfile } from "@/components/user-profile/get-user-profile"
import { getUser } from "@/lib/auth/user"
import { getFlowWithGrants } from "@/lib/database/queries/flow"
import { sortGrants } from "@/lib/grant-utils"
import { getEthAddress } from "@/lib/utils"
import { AllocationProvider } from "@/lib/allocation/allocation-context"
import Image from "next/image"
import { FlowSubmenu } from "../flow/[flowId]/components/flow-submenu"
import { CustomFlow } from "./custom-flows"
import { AllocationBar } from "@/components/global/allocation-bar"
import FlowsList from "../components/flows-list"
import BuilderList from "@/app/components/builder-list"
import { BudgetDialog } from "../flow/[flowId]/components/budget-dialog"
import { getTotalAllocationWeight } from "@/lib/allocation/get-total-allocation-weight"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Suspense } from "react"
import StartupsList from "@/components/global/startups-list"
import { getFlowStats } from "./flow-stats"

interface Props {
  customFlow: CustomFlow
}

export async function CustomFlowPage(props: Props) {
  const { customFlow } = props
  const { flowId } = customFlow

  const [user, { subgrants, ...flow }] = await Promise.all([getUser(), getFlowWithGrants(flowId)])

  const [grants, totalAllocationWeight] = await Promise.all([
    Promise.all(
      subgrants
        .filter((g) => g.isActive)
        .map(async (g) => ({
          ...g,
          profile: await getUserProfile(getEthAddress(g.recipient)),
        })),
    ),
    getTotalAllocationWeight(flow.allocationStrategies, flow.chainId),
  ])

  const isTopLevel = flow.isTopLevel
  const isAccelerator = flow.isAccelerator
  const canManage = user?.address === flow.manager

  const startupsList = isAccelerator
  const flowsList = isTopLevel && !startupsList
  const grantsList = !flowsList && !startupsList

  const relevantGrants = isTopLevel ? grants : [flow]

  const stats = await getFlowStats(flow, relevantGrants, flowId)

  const builders = grants.filter((g) => !g.isFlow && !g.isSiblingFlow)
  const flows = grants.filter((g) => g.isFlow || g.isSiblingFlow)

  return (
    <AllocationProvider
      chainId={flow.chainId}
      contract={getEthAddress(flow.recipient)}
      strategies={flow.allocationStrategies}
      user={user?.address ?? null}
    >
      <div className="relative flex flex-col bg-muted md:max-h-[420px] md:flex-row">
        <div className="container max-w-7xl">
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
                  {flow.tagline}
                </p>

                <dl className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3">
                  {stats.map((stat) =>
                    stat.budgetDialog ? (
                      <BudgetDialog
                        key={stat.name}
                        totalAllocationWeight={Number(totalAllocationWeight)}
                        flow={flow}
                      >
                        <Stat key={stat.name} stat={stat} />
                      </BudgetDialog>
                    ) : (
                      <Stat key={stat.name} stat={stat} />
                    ),
                  )}
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

      <div className="container max-w-7xl pb-24">
        <FlowSubmenu flowId={flowId} segment="approved" />
        {(!subgrants || subgrants.length === 0) && (
          <EmptyState title="No projects found" description="There are no approved projects yet" />
        )}
        {flowsList && (
          <div className="flex flex-col gap-8">
            <FlowsList
              flows={flows.sort((a, b) => sortGrants(a as any, b as any))}
              canManage={canManage}
              contract={getEthAddress(flow.recipient)}
              chainId={flow.chainId}
            />
            {builders.length > 0 && (
              <div className="mb-8">
                <h2 className="mb-4 text-lg font-medium">Builders</h2>
                <BuilderList
                  builders={builders}
                  currency={{
                    underlyingTokenSymbol: flow.underlyingTokenSymbol,
                    underlyingTokenPrefix: flow.underlyingTokenPrefix,
                    underlyingTokenDecimals: flow.underlyingTokenDecimals,
                  }}
                />
              </div>
            )}
          </div>
        )}
        {grantsList && (
          <GrantsList grants={grants.sort(sortGrants)} flow={flow} canManage={canManage} />
        )}
        {startupsList && (
          <Suspense>
            <StartupsList flow={flow} />
          </Suspense>
        )}
      </div>
      <AllocationBar />
    </AllocationProvider>
  )
}

function Stat({
  stat,
}: {
  stat: { name: string; value: number | string | React.ReactNode; tooltip?: string }
}) {
  const content = (
    <div className="flex flex-col-reverse gap-1">
      <dt className="text-xs text-muted-foreground md:text-sm">{stat.name}</dt>
      <dd className="text-xl font-medium tracking-tight text-muted-foreground lg:text-2xl">
        {stat.value}
      </dd>
    </div>
  )

  if (stat.tooltip) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="cursor-help">{content}</div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{stat.tooltip}</p>
        </TooltipContent>
      </Tooltip>
    )
  }

  return content
}
