"use server"

import { NOUNS_TOKEN, VOTING_POWER_SCALE } from "@/lib/config"
import { nounsTokenAbi } from "../../abis"
import { getClient } from "@/lib/viem/client"
import { getEthAddress } from "@/lib/utils"
import { Address } from "viem"
import database from "../../database/flows-db"
import { mainnet } from "viem/chains"
import { getAccountAllocationWeight } from "./account-allocation-weight"

export const getAllocationPower = async (
  address: string | undefined,
  flowId: string | null,
): Promise<bigint> => {
  if (!address) return BigInt(0)

  const tokenRecord = flowId
    ? await database.grant.findUnique({
        where: { id: flowId },
        select: {
          allocationStrategies: true,
          chainId: true,
        },
      })
    : null

  if (tokenRecord?.allocationStrategies) {
    const allocationWeight = await getAccountAllocationWeight(
      tokenRecord.allocationStrategies,
      tokenRecord.chainId,
      address,
    )

    return allocationWeight
  }

  // default to nouns token voting on homepage
  const votingToken = NOUNS_TOKEN
  const chainId = mainnet.id

  const client = getClient(chainId)
  const isNounsToken = votingToken === NOUNS_TOKEN

  try {
    if (isNounsToken) {
      // Nouns token pathway
      const votingPower = await client.readContract({
        address: getEthAddress(votingToken) as Address,
        abi: nounsTokenAbi,
        functionName: "getCurrentVotes",
        args: [getEthAddress(address) as Address],
      })
      return (votingPower ?? BigInt(0)) * VOTING_POWER_SCALE
    }

    return BigInt(0)
  } catch (error) {
    console.error("Error getting voting power:", error)
    return BigInt(0)
  }
}
