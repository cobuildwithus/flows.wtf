"use client"

import { toast } from "sonner"
import { getEthAddress } from "@/lib/utils"
import { useContractTransaction } from "@/lib/wagmi/use-contract-transaction"
import {
  cfav1ForwarderAbi,
  erc20VotesMintableImplAbi,
  gdav1ForwarderAbi,
  rewardPoolImplAbi,
  superfluidPoolAbi,
  tokenVerifierAbi,
} from "@/lib/abis"
import { serialize } from "@/lib/serialize"
import { PERCENTAGE_SCALE } from "@/lib/config"
import { nounsFlowImplAbi } from "@/lib/abis"
import { ERC721VotingToken, UserAllocation } from "@/lib/allocation/allocation-types"

export function useVoteNouns(contract: `0x${string}`, chainId: number, onSuccess: () => void) {
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

        // Get unique owners (or delegators) in order of first appearance **for the batch only**
        const owners = tokenBatch.reduce((acc: `0x${string}`[], token) => {
          if (!acc.includes(getEthAddress(token.owner))) acc.push(getEthAddress(token.owner))
          return acc
        }, [])

        // Group tokenIds by owner (batch‑scoped)
        const tokenIds: bigint[][] = owners.map((owner) =>
          tokenBatch.filter((token) => token.owner === owner).map((token) => BigInt(token.tokenId)),
        )

        const proofs = await fetch("/api/proofs", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ tokens: serialize(tokenBatch), chainId }),
        })
          .then((res) => {
            return res.json()
          })
          .catch((error) => {
            console.error(error)
            return toast.error("Failed to fetch token ownership proofs", {
              description: error.message,
            })
          })

        const recipientIds = allocations.map(
          (allocation) => allocation.recipientId as `0x${string}`,
        )
        const percentAllocations = allocations.map(
          (allocation) => (allocation.bps / 10000) * PERCENTAGE_SCALE,
        )
        const { ownershipStorageProofs, delegateStorageProofs, ...baseProofParams } = proofs

        writeContract({
          account,
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
  }
}
