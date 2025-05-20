"use client"

import { useUserAllocations } from "@/lib/voting/user-allocations/use-user-allocations"

interface Props {
  contract: `0x${string}`
  recipientId: string
}

export const UserVotes = (props: Props) => {
  const { recipientId, contract } = props

  const { allocations } = useUserAllocations(contract)

  const votesCount = allocations.find((v) => v.recipientId === recipientId)?.bps || 0
  return votesCount.toString()
}
