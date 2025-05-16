"use client"

import { toast } from "sonner"
import { useContractTransaction } from "../../wagmi/use-contract-transaction"
import {
  cfav1ForwarderAbi,
  erc20VotesMintableImplAbi,
  gdav1ForwarderAbi,
  rewardPoolImplAbi,
  superfluidPoolAbi,
  vrbsFlowImplAbi,
} from "../../abis"
import { PERCENTAGE_SCALE } from "../../config"
import { ERC721VotingToken, UserVote } from "../vote-types"

export function useVoteVrbs(contract: `0x${string}`, chainId: number, onSuccess: () => void) {
  const { writeContract, prepareWallet, isLoading } = useContractTransaction({
    chainId,
    onSuccess,
  })

  return {
    isLoading,
    saveVotes: async (
      votes: UserVote[],
      account: `0x${string}`,
      tokenBatch: ERC721VotingToken[],
    ) => {
      try {
        await prepareWallet()

        const tokenIds: bigint[] = tokenBatch.map((token) => BigInt(token.tokenId))
        const percentAllocations = votes.map((vote) => (vote.bps / 10000) * PERCENTAGE_SCALE)
        const recipientIds = votes.map((vote) => vote.recipientId as `0x${string}`)

        writeContract({
          account,
          abi: [
            ...vrbsFlowImplAbi,
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
