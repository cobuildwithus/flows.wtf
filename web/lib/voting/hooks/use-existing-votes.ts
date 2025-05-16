"use client"

import { useAccount } from "wagmi"
import { useUserVotes } from "../user-votes/use-user-votes"
import { useEffect, useState } from "react"
import { UserVote } from "../vote-types"

export function useExistingVotes(contract: `0x${string}`) {
  const [votes, setVotes] = useState<UserVote[]>()

  const { address } = useAccount()

  const { votes: userVotes, mutate: mutateUserVotes } = useUserVotes(contract, address)

  useEffect(() => {
    if (typeof votes !== "undefined") return
    if (!userVotes.length) return
    setVotes(userVotes)
  }, [votes, userVotes])

  return {
    userVotes,
    mutateUserVotes,
    votes,
    setVotes,
  }
}
