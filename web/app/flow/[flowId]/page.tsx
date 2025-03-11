import "server-only"

import { EmptyState } from "@/components/ui/empty-state"
import { getUserProfile } from "@/components/user-profile/get-user-profile"
import database, { getCacheStrategy } from "@/lib/database/edge"
import { Status } from "@/lib/enums"
import { getEthAddress } from "@/lib/utils"
import type { Grant } from "@prisma/flows"
import { FlowSubmenu } from "./components/flow-submenu"
import GrantsList from "./components/grants-list"
import { GrantsStories } from "./components/grants-stories"
import { VotingBar } from "./components/voting-bar"

interface Props {
  params: Promise<{ flowId: string }>
}

export default async function FlowPage(props: Props) {
  const { flowId } = await props.params

  const [flow, subgrants] = await Promise.all([
    database.grant.findFirstOrThrow({
      where: { id: flowId },
      ...getCacheStrategy(1200),
    }),
    database.grant.findMany({
      where: { flowId },
      include: {
        derivedData: { select: { lastBuilderUpdate: true, overallGrade: true, title: true } },
      },
      omit: { description: true },
      ...getCacheStrategy(1200),
    }),
  ])

  const grants = await Promise.all(
    subgrants.map(async (g) => ({
      ...g,
      profile: await getUserProfile(getEthAddress(g.recipient)),
    })),
  )

  return (
    <>
      <GrantsStories flowId={flowId} />

      <FlowSubmenu flowId={flowId} segment="approved" />
      {!subgrants || subgrants.length === 0 ? (
        <EmptyState title="No grants found" description="There are no approved grants yet" />
      ) : (
        <GrantsList flow={flow} grants={grants.sort(sortGrants)} />
      )}
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
