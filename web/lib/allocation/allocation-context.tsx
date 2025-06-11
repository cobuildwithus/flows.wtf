"use client"

import { useDelegatedTokens } from "@/lib/allocation/delegated-tokens/use-delegated-tokens"
import { PropsWithChildren, createContext, useContext } from "react"
import { useAccount } from "wagmi"
import { useBatchVoting } from "./hooks/legacy/use-batch-voting"
import { isValidVotingContract, UserAllocation } from "./allocation-types"
import { useVoteNouns } from "./hooks/legacy/use-vote-nouns"
import { mainnet } from "@/addresses"
import { toast } from "sonner"
import { useAllocationContextActive } from "./hooks/use-context-active"
import { useExistingAllocations } from "./hooks/use-existing-allocations"
import { useRouter } from "next/navigation"
import { useAllocateFlow } from "./hooks/use-allocate-flow"
import { useCanAccountAllocate } from "./hooks/use-can-account-allocate"

interface AllocationContextType {
  activate: () => void
  cancel: () => void
  isActive: boolean

  allocations: UserAllocation[]
  saveAllocations: () => void
  updateAllocation: (allocation: UserAllocation) => void
  isLoading: boolean

  allocatedBps: number
  votedCount: number

  batchIndex: number
  batchTotal: number

  votingToken: string | null
  allocator: string | null
  strategies: string[]
  isAllocator: boolean
  chainId: number

  user: string | null

  canAllocate: boolean
}

const AllocationContext = createContext<AllocationContextType | null>(null)

export const AllocationProvider = (
  props: PropsWithChildren<{
    contract: `0x${string}`
    chainId: number
    votingToken: string | null
    allocator: string | null
    user: string | null
    strategies: string[]
    defaultActive?: boolean
  }>,
) => {
  const {
    children,
    contract,
    chainId,
    votingToken,
    allocator,
    strategies,
    user,
    defaultActive = false,
  } = props
  const { address } = useAccount()
  const router = useRouter()
  const { isActive, setIsActive } = useAllocationContextActive(defaultActive)
  const { userAllocations, mutateUserAllocations, allocations, setAllocations } =
    useExistingAllocations(contract)
  const { tokens } = useDelegatedTokens(
    address ? (address?.toLocaleLowerCase() as `0x${string}`) : undefined,
  )
  const { batchIndex, batchTotal, setBatchIndex, tokenBatch } = useBatchVoting(tokens, votingToken)
  const { canAccountAllocate } = useCanAccountAllocate(strategies, chainId, user)

  const onSuccess = async () => {
    // If there are more batches to process, simply advance the index and let the
    // user click the button again. Otherwise finish up as before.
    setTimeout(() => {
      mutateUserAllocations()
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

  const { allocateFunds, isLoading: isLoadingSelfManaged } = useAllocateFlow(
    contract,
    strategies,
    chainId,
    onSuccess,
  )

  return (
    <AllocationContext.Provider
      value={{
        isActive,
        activate: () => setIsActive(true),
        cancel: () => {
          setIsActive(false)
          setAllocations(userAllocations)
          setBatchIndex(0)
        },
        allocations: allocations || [],
        saveAllocations: async () => {
          const existingAllocations = allocations || []
          if (!address)
            return toast.error("Please connect your wallet again. (Try logging out and back in)")

          if (allocator) {
            return await allocateFunds(
              existingAllocations,
              address,
              tokens.map((t) => t.tokenId),
            )
          }

          if (!tokens.length) return toast.error("No delegated tokens found")

          if (!isValidVotingContract(votingToken) && !allocator) {
            return toast.error("Voting is not supported for this token")
          }

          if (isNounsFlow(votingToken)) {
            return await saveVotesNouns(existingAllocations, address, tokenBatch)
          }
        },
        updateAllocation: (allocation: UserAllocation) => {
          const { recipientId, bps } = allocation

          setAllocations([
            ...(allocations || []).filter((a) => a.recipientId !== recipientId),
            ...(bps > 0 ? [{ recipientId, bps }] : []),
          ])
        },
        isLoading: isLoadingNouns || isLoadingSelfManaged,
        allocatedBps: allocations?.reduce((acc, a) => acc + a.bps, 0) || 0,
        votedCount: allocations?.filter((a) => a.bps > 0).length || 0,
        batchIndex,
        batchTotal,
        votingToken,
        allocator,
        isAllocator: allocator === address,
        strategies,
        chainId,
        user,
        canAllocate: canAccountAllocate,
      }}
    >
      {children}
    </AllocationContext.Provider>
  )
}

export const useAllocate = (): AllocationContextType => {
  const context = useContext(AllocationContext)
  if (context === null) {
    throw new Error("useAllocateFlow must be used within a AllocationProvider")
  }
  return context
}

function isNounsFlow(votingToken: string | null) {
  return votingToken === mainnet.NounsToken
}
