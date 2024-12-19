"use client"

import { useUserVotes } from "@/lib/voting/user-votes/use-user-votes"
import { useAccount } from "wagmi"

interface Props {
  contract: `0x${string}`
  recipientId: string
}

export const UserVotes = (props: Props) => {
  const { recipientId, contract } = props
  const { address } = useAccount()

  const { votes } = useUserVotes(contract, address)

  const votesCount = votes.find((v) => v.recipientId === recipientId)?.votesCount || 0
  return votesCount.toString()
}
