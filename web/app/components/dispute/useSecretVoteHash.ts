"use client"

import { generateKVKey, generateSalt, Party, SavedVote } from "@/lib/kv/disputeVote"
import { saveOrGetEncrypted } from "@/lib/kv/kvStore"
import { useEffect, useState } from "react"
import { encodeAbiParameters, keccak256 } from "viem"

export function useSecretVoteHash(arbitrator: string, disputeId: string, address?: string) {
  const [forCommitHash, setForCommitHash] = useState<`0x${string}` | null>(null)
  const [againstCommitHash, setAgainstCommitHash] = useState<`0x${string}` | null>(null)

  useEffect(() => {
    if (!address) return

    const generateVoteHash = async (party: Party) => {
      const { commitHash, salt } = generateCommitment(party)

      const key = generateKVKey(arbitrator, disputeId, address, commitHash)
      const data: SavedVote = {
        choice: party,
        reason: "",
        disputeId: parseInt(disputeId),
        voter: address.toLowerCase() as `0x${string}`,
        salt,
        commitHash,
      }

      // pull if already saved, otherwise save
      const vote = await saveOrGetEncrypted(key, data)

      if (party === Party.Requester) {
        setForCommitHash(vote.commitHash)
      } else {
        setAgainstCommitHash(vote.commitHash)
      }
    }

    generateVoteHash(Party.Requester)
    generateVoteHash(Party.Challenger)
  }, [arbitrator, disputeId, address])

  if (!arbitrator || !disputeId || !address) return { forCommitHash: null, againstCommitHash: null }

  return { forCommitHash, againstCommitHash }
}

const generateCommitment = (party: Party): { commitHash: `0x${string}`; salt: `0x${string}` } => {
  const salt = generateSalt()
  const commitHash = keccak256(
    encodeAbiParameters(
      [{ type: "uint256" }, { type: "string" }, { type: "bytes32" }],
      [BigInt(party), "", salt],
    ),
  )

  return { commitHash, salt }
}
