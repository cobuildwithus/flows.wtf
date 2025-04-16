import "server-only"

import { getFlow, getFlowWithGrants } from "@/lib/database/queries/flow"
import { getPool } from "@/lib/database/queries/pool"
import { getEthAddress } from "@/lib/utils"
import { VotingProvider } from "@/lib/voting/voting-context"
import type { Metadata } from "next"
import type { PropsWithChildren } from "react"
import { base } from "viem/chains"
import { FlowHeader } from "./components/flow-header"
import { getVotingPower } from "@/lib/voting/get-voting-power"
import { getUser } from "@/lib/auth/user"
import { FlowImpactSummary } from "./components/flow-impact-summary"
import database, { getCacheStrategy } from "@/lib/database/edge"

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

  const votingPower = await getVotingPower(user?.address)

  const impacts = await database.impact.findMany({
    where: { complete: true },
    ...getCacheStrategy(1200),
  })

  return (
    <VotingProvider chainId={base.id} contract={getEthAddress(flow.recipient)}>
      <div className="container mt-4 max-w-6xl md:mt-8">
        <FlowHeader flow={flow} votingPower={Number(votingPower)} />
      </div>
      <div className="mt-6">
        <FlowImpactSummary flow={flow} impacts={impacts} />
      </div>
      <div className="container max-w-6xl pb-24">{children}</div>
    </VotingProvider>
  )
}
