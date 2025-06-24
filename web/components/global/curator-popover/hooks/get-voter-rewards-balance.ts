import { erc20VotesArbitratorImplAbi } from "@/lib/abis"
import { getEthAddress } from "@/lib/utils"
import { getClient } from "@/lib/viem/client"
import { base } from "viem/chains"
import type { Address } from "viem"

export async function getVoterRewardsBalance(
  arbitratorAddress: Address,
  disputeId: bigint,
  round: bigint,
  userAddress: Address,
): Promise<bigint> {
  const balance = await getClient(base.id).readContract({
    address: getEthAddress(arbitratorAddress),
    abi: erc20VotesArbitratorImplAbi,
    functionName: "getRewardsForRound",
    args: [disputeId, round, userAddress],
  })

  return balance || BigInt(0)
}
