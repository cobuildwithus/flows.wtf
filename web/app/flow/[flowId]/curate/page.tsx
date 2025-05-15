import "server-only"

import database from "@/lib/database/edge"
import { getFlow } from "@/lib/database/queries/flow"
import { Status } from "@/lib/enums"
import { FlowSubmenu } from "../components/flow-submenu"
import { Suspense } from "react"
import ApplicationsGrantsList from "./components/applications-grants-list"
import RejectedGrantsSection from "./components/rejected-grants-section"
import RemovedGrantsSection from "./components/removed-grants-section"

interface Props {
  params: Promise<{
    flowId: string
  }>
}

export default async function FlowApplicationsPage(props: Props) {
  const { flowId } = await props.params

  const [grantsCount, removedGrantsCount, flow] = await Promise.all([
    database.grant.count({
      where: { flowId, status: { in: [Status.RegistrationRequested] } },
    }),
    database.grant.count({
      where: { flowId, isRemoved: true },
    }),
    getFlow(flowId),
  ])

  return (
    <div className="container max-w-6xl pb-24">
      <FlowSubmenu flowId={flowId} segment="curate" />
      <Suspense>
        <ApplicationsGrantsList flowId={flowId} />
      </Suspense>

      {!flow.isTopLevel && (
        <Suspense>
          <RemovedGrantsSection flow={flow} className="mt-12" defaultOpen={grantsCount === 0} />
        </Suspense>
      )}

      <Suspense>
        <RejectedGrantsSection
          className="mt-12"
          flow={flow}
          defaultOpen={removedGrantsCount === 0 && grantsCount === 0}
        />
      </Suspense>
    </div>
  )
}
