import { Context } from "ponder:registry"
import { customFlowImplAbi, rewardPoolImplAbi, superTokenAbi } from "../../../abis"
import { zeroAddress } from "viem"

export async function getFlowMetadataAndRewardPool(
  context:
    | Context<"NounsFlow:FlowInitialized">
    | Context<"CustomFlow:FlowInitialized">
    | Context<"NounsFlowChildren:FlowInitialized">,
  contract: `0x${string}`,
  managerRewardPool: `0x${string}`,
  superToken: `0x${string}`
) {
  const [metadata, managerRewardSuperfluidPool, underlyingERC20Token] = await Promise.all([
    context.client.readContract({
      address: contract,
      abi: customFlowImplAbi,
      functionName: "flowMetadata",
    }),
    managerRewardPool !== zeroAddress
      ? context.client.readContract({
          address: managerRewardPool,
          abi: rewardPoolImplAbi,
          functionName: "rewardPool",
        })
      : Promise.resolve(zeroAddress),
    context.client.readContract({
      address: superToken,
      abi: superTokenAbi,
      functionName: "getUnderlyingToken",
    }),
  ])

  return { metadata, managerRewardSuperfluidPool, underlyingERC20Token }
}
