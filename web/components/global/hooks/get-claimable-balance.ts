import { nounsFlowImplAbi } from "@/lib/abis"
import { getClient } from "@/lib/viem/client"

export async function getClaimableBalance(
  contract: `0x${string}`,
  chainId: number,
  address?: `0x${string}`,
) {
  if (!address) return BigInt(0)

  try {
    const balance = await getClient(chainId).readContract({
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
