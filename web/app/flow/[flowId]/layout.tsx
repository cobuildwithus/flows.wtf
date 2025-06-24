import "server-only"

import { getUser } from "@/lib/auth/user"
import { getFlow, getFlowWithGrants } from "@/lib/database/queries/flow"
import { getPool } from "@/lib/database/queries/pool"
import { getEthAddress } from "@/lib/utils"
import { AllocationProvider } from "@/lib/allocation/allocation-context"
import type { Metadata } from "next"
import type { PropsWithChildren } from "react"

import { FlowHeader } from "./components/flow-header"

interface Props {
  params: Promise<{ flowId: string }>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { flowId } = await props.params

  const [pool, flow] = await Promise.all([getPool(), getFlow(flowId)])

  return { title: `${flow.title} - ${pool.title}`, description: flow.tagline }
}

export default async function FlowLayout(props: PropsWithChildren<Props>) {
  const { children } = props
  const { flowId } = await props.params

  const [flow, user] = await Promise.all([getFlowWithGrants(flowId), getUser()])

  return (
    <AllocationProvider
      chainId={flow.chainId}
      contract={getEthAddress(flow.recipient)}
      strategies={flow.allocationStrategies}
      user={user?.address ?? null}
    >
      <div className="container mt-4 max-w-6xl md:mt-8">
        <FlowHeader flow={flow} />
      </div>

      {children}
    </AllocationProvider>
  )
}
