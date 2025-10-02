import { Context } from "ponder:registry"
import { customFlowImplAbi, superTokenAbi } from "../../../abis"

export async function getFlowMetadataAndRewardPool(
  context:
    | Context<"NounsFlow:FlowInitialized">
    | Context<"CustomFlow:FlowInitialized">
    | Context<"NounsFlowChildren:FlowInitialized">,
  contract: `0x${string}`,
  superToken: `0x${string}`
) {
  const [metadata, underlyingERC20Token] = await Promise.all([
    context.client.readContract({
      address: contract,
      abi: customFlowImplAbi,
      functionName: "flowMetadata",
    }),
    context.client.readContract({
      address: superToken,
      abi: superTokenAbi,
      functionName: "getUnderlyingToken",
    }),
  ])

  return { metadata, underlyingERC20Token }
}
