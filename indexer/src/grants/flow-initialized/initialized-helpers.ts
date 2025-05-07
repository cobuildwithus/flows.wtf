import { Context } from "ponder:registry"
import { rewardPoolImplAbi } from "../../../abis"
import { zeroAddress } from "viem"

export async function getFlowMetadataAndRewardPool(
  context: Context<"NounsFlow:FlowInitialized"> | Context<"VrbsFlow:FlowInitialized">,
  contract: `0x${string}`,
  managerRewardPool: `0x${string}`
) {
  const [metadata, managerRewardSuperfluidPool] = await Promise.all([
    context.client.readContract({
      address: contract,
      abi: context.contracts.NounsFlow.abi,
      functionName: "flowMetadata",
    }),
    managerRewardPool !== zeroAddress
      ? context.client.readContract({
          address: managerRewardPool,
          abi: rewardPoolImplAbi,
          functionName: "rewardPool",
        })
      : Promise.resolve(zeroAddress),
  ])

  return { metadata, managerRewardSuperfluidPool }
}
