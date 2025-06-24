import { nounsFlowImplAbi } from "@/lib/abis"
import { getClient } from "@/lib/viem/client"
import { base } from "viem/chains"

export async function getClaimableBalance(contract: `0x${string}`, address?: `0x${string}`) {
  if (!address) return BigInt(0)

  try {
    const balance = await getClient(base.id).readContract({
      address: contract,
      abi: nounsFlowImplAbi,
      functionName: "getClaimableBalance",
      args: [address],
    })

    return balance || BigInt(0)
  } catch (error) {
    console.error("Error getting claimable balance:", error)
    return BigInt(0)
  }
}
