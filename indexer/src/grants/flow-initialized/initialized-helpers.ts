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
  // custom flows don't have a typical manager reward pool, they just send to an EOA most of the time
  const getManagerRewardSuperfluidPool = async () => {
    if (managerRewardPool === zeroAddress) {
      return zeroAddress
    }

    try {
      return await context.client.readContract({
        address: managerRewardPool,
        abi: rewardPoolImplAbi,
        functionName: "rewardPool",
      })
    } catch {
      return zeroAddress
    }
  }

  const [metadata, managerRewardSuperfluidPool, underlyingERC20Token] = await Promise.all([
    context.client.readContract({
      address: contract,
      abi: customFlowImplAbi,
      functionName: "flowMetadata",
    }),
    getManagerRewardSuperfluidPool(),
    context.client.readContract({
      address: superToken,
      abi: superTokenAbi,
      functionName: "getUnderlyingToken",
    }),
  ])

  return { metadata, managerRewardSuperfluidPool, underlyingERC20Token }
}
