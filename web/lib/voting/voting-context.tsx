"use client"

import { useDelegatedTokens } from "@/lib/voting/delegated-tokens/use-delegated-tokens"
import { PropsWithChildren, createContext, useContext, useEffect, useState } from "react"
import { useAccount } from "wagmi"
import { useUserVotes } from "./user-votes/use-user-votes"
import {
  getNumBatches,
  getTokenBatchAndLoadingMessage,
  getTokensPerBatch,
} from "./batch-voting-lib"
import { UserVote } from "./vote-types"
import { useVoteNounsFlow } from "./use-vote-nouns-flow"
import { mainnet } from "@/addresses"
import { toast } from "sonner"

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
  const [batchIndex, setBatchIndex] = useState(0)
  const { votes: userVotes, mutate: mutateUserVotes } = useUserVotes(contract, address)
  const { tokens } = useDelegatedTokens(
    address ? (address?.toLocaleLowerCase() as `0x${string}`) : undefined,
  )
  const TOKENS_PER_BATCH = getTokensPerBatch(votingToken)
  const batchTotal = getNumBatches(tokens.length, TOKENS_PER_BATCH)

  const { saveVotes: saveVotesNounsFlow, isLoading: isLoadingNounsFlow } = useVoteNounsFlow(
    contract,
    chainId,
    () => mutateUserVotes(),
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
          setBatchIndex(0)
        },
        votes: votes || [],
        saveVotes: async () => {
          const existingVotes = votes || []
          if (!address)
            return toast.error("Please connect your wallet again. (Try logging out and back in)")
          if (!tokens.length) return toast.error("No delegated tokens found")

          const { tokenBatch, loadingMessage } = getTokenBatchAndLoadingMessage(
            batchIndex,
            batchTotal,
            TOKENS_PER_BATCH,
            tokens,
          )

          if (isNounsFlow(votingToken)) {
            toast.loading(loadingMessage)
            return await saveVotesNounsFlow(existingVotes, address, tokenBatch)
          }

          toast.error("Voting is not supported for this token")
        },
        updateVote: (vote: UserVote) => {
          const { recipientId, bps } = vote

          setVotes([
            ...(votes || []).filter((v) => v.recipientId !== recipientId),
            ...(bps > 0 ? [{ recipientId, bps }] : []),
          ])
        },
        isLoading: isLoadingNounsFlow,
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

function isNounsFlow(votingToken: string | null) {
  return votingToken === mainnet.NounsToken
}
