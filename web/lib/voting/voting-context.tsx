"use client"

import { useDelegatedTokens } from "@/lib/voting/delegated-tokens/use-delegated-tokens"
import { PropsWithChildren, createContext, useContext } from "react"
import { useAccount } from "wagmi"
import { useBatchVoting } from "./hooks/use-batch-voting"
import { isValidVotingContract, UserVote } from "./vote-types"
import { useVoteNouns } from "./hooks/use-vote-nouns"
import { base, mainnet } from "@/addresses"
import { toast } from "sonner"
import { useVotingContextActive } from "./hooks/use-context-active"
import { useExistingVotes } from "./hooks/use-existing-votes"
import { useVoteVrbs } from "./hooks/use-vote-vrbs"
import { useRouter } from "next/navigation"

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
  const router = useRouter()
  const { isActive, setIsActive } = useVotingContextActive()
  const { userVotes, mutateUserVotes, votes, setVotes } = useExistingVotes(contract)
  const { tokens } = useDelegatedTokens(
    address ? (address?.toLocaleLowerCase() as `0x${string}`) : undefined,
  )
  const { batchIndex, batchTotal, setBatchIndex, tokenBatch } = useBatchVoting(tokens, votingToken)

  const onSuccess = async () => {
    // If there are more batches to process, simply advance the index and let the
    // user click the button again. Otherwise finish up as before.
    setTimeout(() => {
      mutateUserVotes()
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
  }

  const { saveVotes: saveVotesNouns, isLoading: isLoadingNouns } = useVoteNouns(
    contract,
    chainId,
    onSuccess,
  )

  const { saveVotes: saveVotesVrbs, isLoading: isLoadingVrbs } = useVoteVrbs(
    contract,
    chainId,
    onSuccess,
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

          if (isNounsFlow(votingToken)) {
            return await saveVotesNouns(existingVotes, address, tokenBatch)
          }

          if (isVrbsFlow(votingToken)) {
            return await saveVotesVrbs(existingVotes, address, tokenBatch)
          }
        },
        updateVote: (vote: UserVote) => {
          const { recipientId, bps } = vote

          setVotes([
            ...(votes || []).filter((v) => v.recipientId !== recipientId),
            ...(bps > 0 ? [{ recipientId, bps }] : []),
          ])
        },
        isLoading: isLoadingNouns || isLoadingVrbs,
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

function isVrbsFlow(votingToken: string | null) {
  return votingToken === base.VrbsToken
}
