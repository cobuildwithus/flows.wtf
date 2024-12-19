import { nounsFlowImplAbi } from "@/lib/abis"
import { l2Client } from "@/lib/viem/client"

export async function getClaimableBalance(contract: `0x${string}`, address?: `0x${string}`) {
  if (!address) return BigInt(0)

  try {
    const balance = await l2Client.readContract({
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
