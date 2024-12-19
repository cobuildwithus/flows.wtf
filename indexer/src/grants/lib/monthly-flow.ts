import { Context } from "ponder:registry"
import { formatEther, getAddress } from "viem"

export async function getMonthlyIncomingFlowRate(
  context: Context,
  parentContract: string,
  recipient: string
) {
  const flowRate = await context.client.readContract({
    address: getAddress(parentContract),
    abi: context.contracts.NounsFlow.abi,
    functionName: "getMemberTotalFlowRate",
    args: [getAddress(recipient)],
  })

  return formatEther(flowRate * BigInt(60 * 60 * 24 * 30))
}
