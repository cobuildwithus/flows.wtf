"use client"

import { Card, CardContent } from "@/components/ui/card"
import { useAllocate } from "@/lib/allocation/allocation-context"
import { FlowsTable, type LimitedFlow } from "./flows-table"
import { FlowCard } from "./flow-card"

interface Props {
  flows: Array<LimitedFlow>
}

export default function FlowsList(props: Props) {
  const { flows } = props
  const { isActive } = useAllocate()

  if (isActive) {
    return (
      <Card>
        <CardContent>
          <FlowsTable flows={flows} />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {flows.map((flow) => (
        <FlowCard key={flow.id} flow={flow} />
      ))}
    </div>
  )
}
