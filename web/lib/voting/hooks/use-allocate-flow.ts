"use client"

import { toast } from "sonner"
import { useContractTransaction } from "../../wagmi/use-contract-transaction"
import {
  cfav1ForwarderAbi,
  erc20VotesMintableImplAbi,
  gdav1ForwarderAbi,
  rewardPoolImplAbi,
  superfluidPoolAbi,
  customFlowImplAbi,
} from "../../abis"
import { PERCENTAGE_SCALE } from "../../config"
import { UserAllocation } from "../vote-types"
import { buildAllocationData } from "../allocation-data/build-allocation-data"

export function useAllocateFlow(
  contract: `0x${string}`,
  strategies: string[],
  chainId: number,
  onSuccess: () => void,
) {
  const { writeContract, prepareWallet, isLoading } = useContractTransaction({
    chainId,
    onSuccess,
  })

  return {
    isLoading,
    allocateFunds: async (
      allocations: UserAllocation[],
      account: `0x${string}`,
      tokenIds?: number[],
    ) => {
      try {
        await prepareWallet()

        const percentAllocations = allocations.map(
          (allocation) => (allocation.bps / 10000) * PERCENTAGE_SCALE,
        )
        const recipientIds = allocations.map(
          (allocation) => allocation.recipientId as `0x${string}`,
        )

        // Build allocation data using the strategies
        const allocationData = await buildAllocationData(strategies, account, chainId, tokenIds)

        writeContract({
          account,
          abi: [
            ...customFlowImplAbi,
            ...rewardPoolImplAbi,
            ...erc20VotesMintableImplAbi,
            ...superfluidPoolAbi,
            ...gdav1ForwarderAbi,
            ...cfav1ForwarderAbi,
          ],
          functionName: "allocate",
          address: contract,
          chainId,
          args: [allocationData, recipientIds, percentAllocations],
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
