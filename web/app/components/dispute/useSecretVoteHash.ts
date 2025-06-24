"use client"

import { Party } from "@/lib/kv/disputeVote"
import { generateVoteHash } from "./get-secret-vote-hash"
import { useEffect, useState } from "react"

export function useSecretVoteHash(
  arbitrator: string,
  disputeId: string,
  chainId: number,
  address?: string,
) {
  const [forCommitHash, setForCommitHash] = useState<`0x${string}` | null>(null)
  const [againstCommitHash, setAgainstCommitHash] = useState<`0x${string}` | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!address) return

    const generateVotes = async () => {
      setIsLoading(true)
      try {
        const [forHash, againstHash] = await Promise.all([
          generateVoteHash(Party.Requester, arbitrator, disputeId, address, chainId),
          generateVoteHash(Party.Challenger, arbitrator, disputeId, address, chainId),
        ])

        setForCommitHash(forHash)
        setAgainstCommitHash(againstHash)
        setError(null)
      } catch (error) {
        console.error("Error generating vote hashes:", error)
        setError(error instanceof Error ? error : new Error("Failed to generate vote hashes"))
      } finally {
        setIsLoading(false)
      }
    }

    generateVotes()
  }, [arbitrator, disputeId, address])

  if (!arbitrator || !disputeId || !address)
    return { forCommitHash: null, againstCommitHash: null, error: null, isLoading: false }

  return { forCommitHash, againstCommitHash, error, isLoading }
}
