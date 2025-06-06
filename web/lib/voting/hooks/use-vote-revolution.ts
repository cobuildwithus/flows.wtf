"use client"

import { toast } from "sonner"
import { useContractTransaction } from "../../wagmi/use-contract-transaction"
import {
  cfav1ForwarderAbi,
  erc20VotesMintableImplAbi,
  gdav1ForwarderAbi,
  rewardPoolImplAbi,
  superfluidPoolAbi,
  revolutionFlowImplAbi,
} from "../../abis"
import { PERCENTAGE_SCALE } from "../../config"
import { ERC721VotingToken, UserAllocation } from "../vote-types"

export function useVoteRevolution(contract: `0x${string}`, chainId: number, onSuccess: () => void) {
  const { writeContract, prepareWallet, isLoading } = useContractTransaction({
    chainId,
    onSuccess,
  })

  return {
    isLoading,
    saveVotes: async (
      allocations: UserAllocation[],
      account: `0x${string}`,
      tokenBatch: ERC721VotingToken[],
    ) => {
      try {
        await prepareWallet()

        const tokenIds: bigint[] = tokenBatch.map((token) => BigInt(token.tokenId))
        const percentAllocations = allocations.map(
          (allocation) => (allocation.bps / 10000) * PERCENTAGE_SCALE,
        )
        const recipientIds = allocations.map(
          (allocation) => allocation.recipientId as `0x${string}`,
        )

        writeContract({
          account,
          abi: [
            ...revolutionFlowImplAbi,
            ...rewardPoolImplAbi,
            ...erc20VotesMintableImplAbi,
            ...superfluidPoolAbi,
            ...gdav1ForwarderAbi,
            ...cfav1ForwarderAbi,
          ],
          functionName: "castVotes",
          address: contract,
          chainId,
          args: [tokenIds, recipientIds, percentAllocations],
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
