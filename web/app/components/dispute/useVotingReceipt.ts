import { erc20VotesArbitratorImplAbi } from "@/lib/abis"
import { Address } from "viem"

import { useReadContract } from "wagmi"

export function useVotingReceipt(
  arbitratorContract: Address,
  disputeId: string,
  chainId: number,
  voter?: Address,
) {
  const { data: receipt } = useReadContract({
    abi: erc20VotesArbitratorImplAbi,
    address: arbitratorContract,
    chainId,
    functionName: "getReceipt",
    args: [BigInt(disputeId), voter as Address],
    query: { enabled: !!voter },
  })

  return receipt
}
