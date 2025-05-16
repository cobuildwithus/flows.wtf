"use client"

import { useDelegatedTokens } from "@/lib/voting/delegated-tokens/use-delegated-tokens"
import { PropsWithChildren, createContext, useContext, useEffect, useState } from "react"
import { useAccount } from "wagmi"
import { useUserVotes } from "./user-votes/use-user-votes"
import { useBatchVoting } from "./hooks/use-batch-voting"
import { isValidVotingContract, UserVote } from "./vote-types"
import { useVoteNounsFlow } from "./hooks/use-vote-nouns-flow"
import { mainnet } from "@/addresses"
import { toast } from "sonner"
import { useVotingContextActive } from "./hooks/use-context-active"
import { useVotingPower } from "./hooks/use-voting-power"
import { useExistingVotes } from "./hooks/use-existing-votes"

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
  const { address } = useAccount()
  const { isActive, setIsActive } = useVotingContextActive()
  const { userVotes, mutateUserVotes, votes, setVotes } = useExistingVotes(contract)
  const { tokens } = useDelegatedTokens(
    address ? (address?.toLocaleLowerCase() as `0x${string}`) : undefined,
  )
  const { batchIndex, batchTotal, setBatchIndex, tokenBatch, loadingMessage } = useBatchVoting(
    tokens,
    votingToken,
  )

  const { saveVotes: saveVotesNounsFlow, isLoading: isLoadingNounsFlow } = useVoteNounsFlow(
    contract,
    chainId,
    () => mutateUserVotes(),
  )

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

          if (!isValidVotingContract(votingToken)) {
            return toast.error("Voting is not supported for this token")
          }

          toast.loading(loadingMessage)

          if (isNounsFlow(votingToken)) {
            return await saveVotesNounsFlow(existingVotes, address, tokenBatch)
          }
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
