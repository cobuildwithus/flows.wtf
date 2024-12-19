"use client"

import { useDelegatedTokens } from "@/lib/voting/delegated-tokens/use-delegated-tokens"
import { useContractTransaction } from "@/lib/wagmi/use-contract-transaction"
import { Vote } from "@prisma/flows"
import { useRouter } from "next/navigation"
import { PropsWithChildren, createContext, useContext, useEffect, useState } from "react"
import { toast } from "sonner"
import { useAccount } from "wagmi"
import {
  cfav1ForwarderAbi,
  erc20VotesMintableImplAbi,
  gdav1ForwarderAbi,
  nounsFlowImplAbi,
  rewardPoolImplAbi,
  superfluidPoolAbi,
  tokenVerifierAbi,
} from "../abis"
import { PERCENTAGE_SCALE } from "../config"
import { useUserVotes } from "./user-votes/use-user-votes"
import { serialize } from "../serialize"

type UserVote = Pick<Vote, "bps" | "recipientId">

interface VotingContextType {
  activate: () => void
  cancel: () => void
  isActive: boolean

  votes: UserVote[]
  saveVotes: () => void
  updateVote: (vote: UserVote) => void
  isLoading: boolean

  allocatedBps: number
  votedCount: number
}

const VotingContext = createContext<VotingContextType | null>(null)

export const VotingProvider = (
  props: PropsWithChildren<{ contract: `0x${string}`; chainId: number }>,
) => {
  const { children, contract, chainId } = props
  const [isActive, setIsActive] = useState(false)
  const [votes, setVotes] = useState<UserVote[]>()
  const { address } = useAccount()
  const router = useRouter()

  const { votes: userVotes, mutate } = useUserVotes(contract, address)

  const { writeContract, prepareWallet, isLoading } = useContractTransaction({
    chainId,
    onSuccess: async () => {
      setTimeout(() => {
        mutate()
        router.refresh()
      }, 3000) // refresh votes data when ingestion should be finished
      setIsActive(false)
    },
  })

  const { tokens } = useDelegatedTokens(
    address ? (address?.toLocaleLowerCase() as `0x${string}`) : undefined,
  )

  useEffect(() => {
    if (typeof votes !== "undefined") return
    if (!userVotes.length) return
    setVotes(userVotes)
  }, [votes, userVotes])

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isActive) setIsActive(false)
    }

    document.addEventListener("keydown", handleEscape)
    return () => {
      document.removeEventListener("keydown", handleEscape)
    }
  }, [isActive])

  return (
    <VotingContext.Provider
      value={{
        isActive,
        activate: () => setIsActive(true),
        cancel: () => {
          setIsActive(false)
          setVotes(userVotes)
        },
        votes: votes || [],
        saveVotes: async () => {
          try {
            if (!votes) return
            if (!address)
              return toast.error("Please connect your wallet again. (Try logging out and back in)")
            if (!tokens.length) return toast.error("No delegated tokens found")

            const toastId = toast.loading("Preparing vote...")

            // Get unique owners (or delegators) in order of first appearance
            const owners = tokens.reduce((acc: `0x${string}`[], token) => {
              if (!acc.includes(token.owner)) acc.push(token.owner)
              return acc
            }, [])

            // Group tokenIds by owner
            const tokenIds: bigint[][] = owners.map((owner) =>
              tokens.filter((token) => token.owner === owner).map((token) => token.id),
            )

            const proofs = await fetch("/api/proofs", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ tokens: serialize(tokens) }),
            })
              .then((res) => {
                console.log(res)
                return res.json()
              })
              .catch((error) => {
                console.error(error)
                return toast.error("Failed to fetch token ownership proofs", {
                  description: error.message,
                })
              })

            const recipientIds = votes.map((vote) => vote.recipientId as `0x${string}`)
            const percentAllocations = votes.map((vote) => (vote.bps / 10000) * PERCENTAGE_SCALE)
            const { ownershipStorageProofs, delegateStorageProofs, ...baseProofParams } = proofs

            await prepareWallet(toastId)

            writeContract({
              account: address,
              abi: [
                ...nounsFlowImplAbi,
                ...rewardPoolImplAbi,
                ...erc20VotesMintableImplAbi,
                ...superfluidPoolAbi,
                ...tokenVerifierAbi,
                ...gdav1ForwarderAbi,
                ...cfav1ForwarderAbi,
              ],
              functionName: "castVotes",
              address: contract,
              chainId,
              args: [
                owners,
                tokenIds,
                recipientIds,
                percentAllocations,
                baseProofParams,
                ownershipStorageProofs,
                delegateStorageProofs,
              ],
            })
          } catch (e: any) {
            console.error(e)
            return toast.error(`Failed to vote`, { description: e.message })
          }
        },
        updateVote: (vote: UserVote) => {
          const { recipientId, bps } = vote

          setVotes([
            ...(votes || []).filter((v) => v.recipientId !== recipientId),
            ...(bps > 0 ? [{ recipientId, bps }] : []),
          ])
        },
        isLoading,
        allocatedBps: votes?.reduce((acc, v) => acc + v.bps, 0) || 0,
        votedCount: votes?.filter((v) => v.bps > 0).length || 0,
      }}
    >
      {children}
    </VotingContext.Provider>
  )
}

export const useVoting = (): VotingContextType => {
  const context = useContext(VotingContext)
  if (context === null) {
    throw new Error("useVoting must be used within a VotingProvider")
  }
  return context
}
