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
import { UserAllocation } from "../vote-types"

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
    allocateFunds: async (allocations: UserAllocation[], account: `0x${string}`) => {
      try {
        await prepareWallet()

        const percentAllocations = allocations.map(
          (allocation) => (allocation.bps / 10000) * PERCENTAGE_SCALE,
        )
        const recipientIds = allocations.map(
          (allocation) => allocation.recipientId as `0x${string}`,
        )

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
