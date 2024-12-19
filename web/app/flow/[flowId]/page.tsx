import "server-only"

import { EmptyState } from "@/components/ui/empty-state"
import { getUserProfiles } from "@/components/user-profile/get-user-profile"
import database, { getCacheStrategy } from "@/lib/database/edge"
import { Status } from "@/lib/enums"
import { getEthAddress } from "@/lib/utils"
import { Grant } from "@prisma/flows"
import { FlowSubmenu } from "./components/flow-submenu"
import GrantsList from "./components/grants-list"
import { GrantsStories } from "./components/grants-stories"
import { VotingBar } from "./components/voting-bar"

export const runtime = "nodejs"

interface Props {
  params: Promise<{ flowId: string }>
}

export default async function FlowPage(props: Props) {
  const { flowId } = await props.params

  const [flow, subgrants] = await Promise.all([
    database.grant.findFirstOrThrow({
      where: { id: flowId, isActive: true },
      ...getCacheStrategy(1200),
    }),
    database.grant.findMany({
      where: { flowId, isActive: true },
      include: { derivedData: true },
      ...getCacheStrategy(1200),
    }),
  ])

  if (!subgrants || subgrants.length === 0) {
    return <EmptyState title="No grants found" description="There are no approved grants yet" />
  }

  const profiles = await getUserProfiles(subgrants.map((g) => getEthAddress(g.recipient)))

  return (
    <>
      <GrantsStories flowId={flowId} />

      <FlowSubmenu flowId={flowId} segment="approved" />

      <GrantsList
        flow={flow}
        grants={subgrants
          .map((g) => ({
            ...g,
            profile: profiles.find((p) => p.address === getEthAddress(g.recipient))!,
          }))
          .sort(sortGrants)}
      />
      <VotingBar />
    </>
  )
}

function sortGrants(a: Grant, b: Grant) {
  const aIsClearingRequested = a.status === Status.ClearingRequested
  const bIsClearingRequested = b.status === Status.ClearingRequested
  if (aIsClearingRequested && !bIsClearingRequested) {
    return -1
  } else if (!aIsClearingRequested && bIsClearingRequested) {
    return 1
  } else {
    return Number(b.monthlyIncomingFlowRate) - Number(a.monthlyIncomingFlowRate)
  }
}
