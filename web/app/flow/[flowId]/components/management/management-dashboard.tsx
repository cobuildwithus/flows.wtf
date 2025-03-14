"use client"

import { FlowWithGrants } from "@/lib/database/queries/flow"
import { useIsFlowOwner } from "../../hooks/useIsFlowOwner"
import { useArbitrator } from "../../hooks/useArbitrator"
import { ArbitratorManagement } from "./contracts/arbitrator"
import { FlowManagement } from "./contracts/flow"
import { TCRManagement } from "./contracts/tcr"
import { getEthAddress } from "@/lib/utils"
import { TokenEmitterManagement } from "./contracts/token-emitter"

interface Props {
  flow: FlowWithGrants
}

export const ManageFlow = ({ flow }: Props) => {
  const flowAddress = getEthAddress(flow.recipient)
  const tcrAddress = getEthAddress(flow.tcr)
  const tokenEmitterAddress = getEthAddress(flow.tokenEmitter)
  const isFlowOwner = useIsFlowOwner(flowAddress)
  const arbitratorAddress = useArbitrator(tcrAddress)

  if (!isFlowOwner) return null
  return (
    <div className="min-h-screen bg-background py-8">
      <h1 className="mb-8 text-3xl font-bold tracking-tight">Contract Management</h1>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        <TokenEmitterManagement tokenEmitterAddress={tokenEmitterAddress} />
        <FlowManagement flowAddress={flowAddress} />
        <TCRManagement tcrAddress={tcrAddress} />
        <ArbitratorManagement arbitratorAddress={arbitratorAddress} />
      </div>
    </div>
  )
}
