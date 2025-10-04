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
import { UserAllocation } from "../allocation-types"
import { buildAllocationData } from "../allocation-data/build-data"
import { sortRecipientsAndAllocations } from "../utils/sort-recipients"
import { getAddress } from "viem"

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

        const percentAllocations = allocations.map((allocation) =>
          Math.floor((allocation.bps * PERCENTAGE_SCALE) / 10000),
        )
        const recipientIds = allocations.map(
          (allocation) => allocation.recipientId as `0x${string}`,
        )

        // Build allocationData (strategy aux) based on known keys (client-side)
        const { allocationData: clientAllocationData } = await buildAllocationData(
          strategies,
          chainId,
          tokenIds,
        )

        // Fetch DB-backed witnesses via API; require all to be present
        const res = await fetch("/api/allocations/prev-witness", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chainId,
            flow: contract,
            strategies: strategies.map((s) => getAddress(s)) as `0x${string}`[],
            allocator: account,
            tokenIds,
          }),
        })
        if (!res.ok) throw new Error("Failed to fetch previous allocation witnesses")
        const data = (await res.json()) as {
          prevAllocationWitnesses: (string | null)[][]
          allocationData?: `0x${string}`[][]
        }
        const allPresent = data.prevAllocationWitnesses.every((row) => row.every((w) => !!w))
        if (!allPresent) {
          throw new Error(
            "Previous allocation witnesses are unavailable; wait for indexer to sync and try again.",
          )
        }
        const prevAllocationWitnesses = data.prevAllocationWitnesses as `0x${string}`[][]
        const allocationData = data.allocationData?.length
          ? (data.allocationData as `0x${string}`[][])
          : clientAllocationData

        const sorted = sortRecipientsAndAllocations(recipientIds, percentAllocations)

        await writeContract({
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
          args: [
            allocationData,
            prevAllocationWitnesses,
            sorted.recipientIds,
            sorted.percentAllocations,
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
