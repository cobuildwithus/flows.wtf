"use client"

import { toast } from "sonner"
import { useContractTransaction } from "../../wagmi/use-contract-transaction"
import {
  cfav1ForwarderAbi,
  erc20VotesMintableImplAbi,
  gdav1ForwarderAbi,
  rewardPoolImplAbi,
  superfluidPoolAbi,
  selfManagedFlowImplAbi,
} from "../../abis"
import { PERCENTAGE_SCALE } from "../../config"
import { UserVote } from "../vote-types"

export function useAllocateSelfManagedFlow(
  contract: `0x${string}`,
  chainId: number,
  onSuccess: () => void,
) {
  const { writeContract, prepareWallet, isLoading } = useContractTransaction({
    chainId,
    onSuccess,
  })

  return {
    isLoading,
    allocateFunds: async (votes: UserVote[], account: `0x${string}`) => {
      try {
        await prepareWallet()

        const percentAllocations = votes.map((vote) => (vote.bps / 10000) * PERCENTAGE_SCALE)
        const recipientIds = votes.map((vote) => vote.recipientId as `0x${string}`)

        writeContract({
          account,
          abi: [
            ...selfManagedFlowImplAbi,
            ...rewardPoolImplAbi,
            ...erc20VotesMintableImplAbi,
            ...superfluidPoolAbi,
            ...gdav1ForwarderAbi,
            ...cfav1ForwarderAbi,
          ],
          functionName: "setManualAllocations",
          address: contract,
          chainId,
          args: [recipientIds, percentAllocations],
        })
      } catch (e) {
        console.error(e)
        return toast.error(`Failed to vote`, {
          description: e instanceof Error ? e.message : "Unknown error",
        })
      }
    },
  }
}
