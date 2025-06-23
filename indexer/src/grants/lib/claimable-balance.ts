import { Context } from "ponder:registry"
import { formatEther, getAddress } from "viem"
import { customFlowImplAbi } from "../../../abis"

export async function getClaimableBalance(context: Context, contract: string, recipient: string) {
  const claimableBalance = await context.client.readContract({
    address: getAddress(contract),
    abi: customFlowImplAbi,
    functionName: "getClaimableBalance",
    args: [getAddress(recipient)],
  })

  return formatEther(claimableBalance)
}
