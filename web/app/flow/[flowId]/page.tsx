import "server-only"

import { EmptyState } from "@/components/ui/empty-state"
import { getUserProfile } from "@/components/user-profile/get-user-profile"
import { getFlowWithGrants } from "@/lib/database/queries/flow"
import { Status } from "@/lib/enums"
import { getEthAddress } from "@/lib/utils"
import type { Grant } from "@prisma/flows"
import { FlowImpactSummary } from "./components/flow-impact-summary"
import { FlowSubmenu } from "./components/flow-submenu"
import GrantsList from "./components/grants-list"
import { VotingBar } from "./components/voting-bar"

interface Props {
  params: Promise<{ flowId: string }>
  searchParams: Promise<{ date?: string }>
}

export default async function FlowPage(props: Props) {
  const { flowId } = await props.params
  const { date } = await props.searchParams

  const { subgrants, ...flow } = await getFlowWithGrants(flowId)

  const grants = await Promise.all(
    subgrants.map(async (g) => ({
      ...g,
      profile: await getUserProfile(getEthAddress(g.recipient)),
    })),
  )

  return (
    <>
      <div className="container max-w-6xl pb-24">
        <FlowSubmenu flowId={flowId} segment="approved" />
        {!subgrants || subgrants.length === 0 ? (
          <EmptyState title="No grants found" description="There are no approved grants yet" />
        ) : (
          <GrantsList flow={flow} grants={grants.sort(sortGrants)} />
        )}
      </div>
      <div className="pt-6" id="impact">
        <FlowImpactSummary
          flowId={flowId}
          impactMonthly={flow.derivedData?.impactMonthly ?? []}
          subgrantsIds={subgrants.map((g) => g.id)}
          date={date}
        />
      </div>
      <VotingBar />
    </>
  )
}

function sortGrants(a: Omit<Grant, "description">, b: Omit<Grant, "description">) {
  const aIsClearingRequested = a.status === Status.ClearingRequested
  const bIsClearingRequested = b.status === Status.ClearingRequested

  if (aIsClearingRequested && !bIsClearingRequested) {
    return -1
  }
  if (!aIsClearingRequested && bIsClearingRequested) {
    return 1
  }
  return Number(b.monthlyIncomingFlowRate) - Number(a.monthlyIncomingFlowRate)
}
