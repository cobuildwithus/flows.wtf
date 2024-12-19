import { Context } from "ponder:registry"
import { formatEther, getAddress } from "viem"

export async function getClaimableBalance(context: Context, contract: string, recipient: string) {
  const totalEarned = await context.client.readContract({
    address: getAddress(contract),
    abi: context.contracts.NounsFlow.abi,
    functionName: "getClaimableBalance",
    args: [getAddress(recipient)],
  })

  return formatEther(totalEarned)
}
