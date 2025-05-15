import "server-only"

import { getUser } from "@/lib/auth/user"
import { getFlow, getFlowWithGrants } from "@/lib/database/queries/flow"
import { getPool } from "@/lib/database/queries/pool"
import { getEthAddress } from "@/lib/utils"
import { getVotingPower } from "@/lib/voting/get-voting-power"
import { VotingProvider } from "@/lib/voting/voting-context"
import type { Metadata } from "next"
import type { PropsWithChildren } from "react"
import { base } from "viem/chains"
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

  const votingPower = await getVotingPower(user?.address)

  return (
    <VotingProvider
      chainId={base.id}
      contract={getEthAddress(flow.recipient)}
      votingToken={flow.erc721VotingToken}
    >
      <div className="container mt-4 max-w-6xl md:mt-8">
        <FlowHeader
          flow={flow}
          votingPower={Number(votingPower)}
          erc721VotingToken={flow.erc721VotingToken}
        />
      </div>

      {children}
    </VotingProvider>
  )
}
