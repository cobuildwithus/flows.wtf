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
import { getEthAddress } from "../utils"
import { mainnet } from "@/addresses"

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

  batchIndex: number
  batchTotal: number
}

const VotingContext = createContext<VotingContextType | null>(null)

export const VotingProvider = (
  props: PropsWithChildren<{
    contract: `0x${string}`
    chainId: number
    votingToken: string | null
  }>,
) => {
  const { children, contract, chainId, votingToken } = props
  const [isActive, setIsActive] = useState(false)
  const [votes, setVotes] = useState<UserVote[]>()
  const { address } = useAccount()
  const router = useRouter()
  const [batchIndex, setBatchIndex] = useState(0)
  const { votes: userVotes, mutate } = useUserVotes(contract, address)
  const { tokens } = useDelegatedTokens(
    address ? (address?.toLocaleLowerCase() as `0x${string}`) : undefined,
  )

  const TOKENS_PER_BATCH = getTokensPerBatch(votingToken)

  const { writeContract, prepareWallet, isLoading } = useContractTransaction({
    chainId,
    onSuccess: async () => {
      // If there are more batches to process, simply advance the index and let the
      // user click the button again. Otherwise finish up as before.
      setTimeout(() => {
        mutate()
      }, 3000)

      setBatchIndex((prev) => {
        const next = prev + 1
        if (next < batchTotal) {
          return next
        }

        // All batches submitted – close the voting bar and reset.
        setIsActive(false)
        router.refresh()
        return 0
      })
    },
  })

  // Compute total batches whenever the delegated token list changes. We always have at
  // least one batch so that the UI label logic is simplified.
  const batchTotal = Math.max(1, Math.ceil(tokens.length / TOKENS_PER_BATCH))

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
          setBatchIndex(0)
        },
        votes: votes || [],
        saveVotes: async () => {
          try {
            if (!votes) return
            if (!votingToken) return toast.error("No voting token available")
            if (!address)
              return toast.error("Please connect your wallet again. (Try logging out and back in)")
            if (!tokens.length) return toast.error("No delegated tokens found")

            // Slice the delegated tokens for the current batch so that we never
            // exceed the gas limit. Each batch handles at most TOKENS_PER_BATCH
            const start = batchIndex * TOKENS_PER_BATCH
            const end = start + TOKENS_PER_BATCH
            const tokenBatch = tokens.slice(start, end)

            const toastId = toast.loading(
              batchTotal > 1
                ? `Preparing vote batch ${batchIndex + 1} of ${batchTotal}...`
                : "Preparing vote...",
            )

            // Get unique owners (or delegators) in order of first appearance **for the batch only**
            const owners = tokenBatch.reduce((acc: `0x${string}`[], token) => {
              if (!acc.includes(getEthAddress(token.owner))) acc.push(getEthAddress(token.owner))
              return acc
            }, [])

            // Group tokenIds by owner (batch‑scoped)
            const tokenIds: bigint[][] = owners.map((owner) =>
              tokenBatch
                .filter((token) => token.owner === owner)
                .map((token) => BigInt(token.tokenId)),
            )

            const proofs = await fetch("/api/proofs", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ tokens: serialize(tokenBatch) }),
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
          } catch (e) {
            console.error(e)
            return toast.error(`Failed to vote`, {
              description: e instanceof Error ? e.message : "Unknown error",
            })
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
        batchIndex,
        batchTotal,
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

export const getTokensPerBatch = (tokenContract: string | null) => {
  if (!tokenContract) return 1e3

  // Since NounsFlow requires posting proofs onchain, we limit the number of tokens per batch
  // to 15 to avoid hitting the gas limit.
  if (tokenContract === mainnet.NounsToken) {
    return 15
  }

  return 1e3
}
