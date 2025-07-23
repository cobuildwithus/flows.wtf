"use client"

import { Card, CardContent } from "@/components/ui/card"
import { useAllocate } from "@/lib/allocation/allocation-context"
import { FlowsTable, type LimitedFlow } from "./flows-table"
import { FlowCard } from "./flow-card"

interface Props {
  flows: Array<LimitedFlow>
  canManage?: boolean
  contract: `0x${string}`
  chainId: number
}

export default function FlowsList(props: Props) {
  const { flows, canManage = false, contract, chainId } = props
  const { isActive } = useAllocate()

  if (isActive) {
    return (
      <Card>
        <CardContent>
          <FlowsTable flows={flows} canManage={canManage} contract={contract} chainId={chainId} />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {flows.map((flow) => (
        <FlowCard key={flow.id} flow={flow} />
      ))}
    </div>
  )
}
