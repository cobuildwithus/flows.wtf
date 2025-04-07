import "server-only"

import { EmptyState } from "@/components/ui/empty-state"
import database from "@/lib/database/edge"
import { getFlow } from "@/lib/database/queries/flow"
import { Status } from "@/lib/enums"
import { FlowSubmenu } from "../components/flow-submenu"
import RemovedGrantsList from "../components/curate/removed-grants-list"
import { Suspense } from "react"
import ApplicationsGrantsList from "../components/curate/applications-grants-list"

interface Props {
  params: Promise<{
    flowId: string
  }>
}

export default async function FlowApplicationsPage(props: Props) {
  const { flowId } = await props.params

  const [grantsCount, removedGrantsCount] = await Promise.all([
    database.grant.count({
      where: { flowId, status: { in: [Status.RegistrationRequested] } },
    }),
    database.grant.count({
      where: { flowId, isRemoved: true },
    }),
  ])

  if (grantsCount === 0 && removedGrantsCount === 0) {
    return (
      <>
        <FlowSubmenu flowId={flowId} segment="curate" />
        <EmptyState
          title="No applications found"
          description="There are no awaiting grant applications"
        />
      </>
    )
  }

  return (
    <>
      <FlowSubmenu flowId={flowId} segment="curate" />
      <Suspense>
        <ApplicationsGrantsList flowId={flowId} />
      </Suspense>

      <Suspense>
        <RemovedGrantsList
          type="removed"
          className="mt-12"
          flowId={flowId}
          defaultOpen={grantsCount === 0}
        />
      </Suspense>

      <Suspense>
        <RemovedGrantsList
          type="rejected"
          className="mt-12"
          flowId={flowId}
          defaultOpen={removedGrantsCount === 0 && grantsCount === 0}
        />
      </Suspense>
    </>
  )
}
