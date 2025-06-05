import "server-only"

import { AgentChatProvider } from "@/app/chat/components/agent-chat"
import { EmptyState } from "@/components/ui/empty-state"
import { getUserProfile } from "@/components/user-profile/get-user-profile"
import { getPrivyIdToken } from "@/lib/auth/get-user-from-cookie"
import { getUser } from "@/lib/auth/user"
import { getFlowWithGrants } from "@/lib/database/queries/flow"
import { getEthAddress } from "@/lib/utils"
import { FlowImpactSummary } from "./components/flow-impact-summary"
import { FlowSubmenu } from "./components/flow-submenu"
import GrantsList from "./components/grants-list"
import { AllocationBar } from "@/components/global/allocation-bar"
import { sortGrants } from "@/lib/grant-utils"

interface Props {
  params: Promise<{ flowId: string }>
  searchParams: Promise<{ date?: string; impactId?: string }>
}

export default async function FlowPage(props: Props) {
  const { flowId } = await props.params
  const { date, impactId } = await props.searchParams

  const { subgrants, ...flow } = await getFlowWithGrants(flowId)

  const user = await getUser()

  const grants = await Promise.all(
    subgrants
      .filter((g) => g.isActive)
      .map(async (g) => ({
        ...g,
        profile: await getUserProfile(getEthAddress(g.allocator || g.recipient)),
      })),
  )

  const monthlyImpact = flow.derivedData?.impactMonthly

  return (
    <AgentChatProvider
      id={`flow-${flow.id}-${user?.address}`}
      type="flo"
      user={user}
      data={{ flowId: flow.id }}
      identityToken={await getPrivyIdToken()}
    >
      {!flow.isTopLevel && monthlyImpact && (
        <div className="pt-6" id="impact">
          <FlowImpactSummary
            flowId={flowId}
            impactMonthly={monthlyImpact ?? []}
            subgrantsIds={subgrants.map((g) => g.id)}
            date={date}
            impactId={impactId}
          />
        </div>
      )}
      <div className="container max-w-6xl pb-24">
        <FlowSubmenu flowId={flowId} segment="approved" />
        {!subgrants || subgrants.length === 0 ? (
          <EmptyState title="No grants found" description="There are no approved grants yet" />
        ) : (
          <GrantsList flow={flow} grants={grants.sort(sortGrants)} />
        )}
      </div>

      <AllocationBar />
    </AgentChatProvider>
  )
}
