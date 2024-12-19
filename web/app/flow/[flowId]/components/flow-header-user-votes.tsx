"use client"

import { useUserVotes } from "@/lib/voting/user-votes/use-user-votes"
import { useAccount } from "wagmi"

interface Props {
  parent: `0x${string}`
  recipientId: string
}

export const FlowHeaderUserVotes = (props: Props) => {
  const { parent, recipientId } = props
  const { address } = useAccount()
  const { votes } = useUserVotes(parent, address)

  const votesCount = votes.find((v) => v.recipientId === recipientId)?.bps || 0

  return (
    <div className="md:text-center">
      <p className="mb-1.5 text-muted-foreground">Your Vote</p>
      <p className="text-sm font-medium">{votesCount / 100}%</p>
    </div>
  )
}
