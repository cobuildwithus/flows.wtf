"use client"

import { Card, CardContent } from "@/components/ui/card"
import { useVoting } from "@/lib/voting/voting-context"
import { Grant } from "@prisma/flows"
import { FlowCard } from "./flow-card"
import { FlowsTable } from "./flows-table"

interface Props {
  flows: Array<Grant>
}

export default function FlowsList(props: Props) {
  const { flows } = props
  const { isActive } = useVoting()

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
