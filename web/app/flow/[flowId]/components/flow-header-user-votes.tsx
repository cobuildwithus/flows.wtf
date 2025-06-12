"use client"

import { useUserAllocations } from "@/lib/allocation/user-allocations/use-user-allocations"

interface Props {
  parent: `0x${string}`
  recipientId: string
}

export const FlowHeaderUserVotes = (props: Props) => {
  const { parent, recipientId } = props
  const { allocations } = useUserAllocations(parent)

  const votesCount = allocations.find((v) => v.recipientId === recipientId)?.bps || 0

  return (
    <div className="md:text-center">
      <p className="mb-1.5 text-muted-foreground">Your Vote</p>
      <p className="text-sm font-medium">{votesCount / 100}%</p>
    </div>
  )
}
