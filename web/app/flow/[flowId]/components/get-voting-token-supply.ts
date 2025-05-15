import { getEthAddress } from "@/lib/utils"
import { l1Client, l2Client } from "@/lib/viem/client"
import { erc20Abi } from "viem"
import { base, mainnet } from "viem/chains"

export async function getVotingTokenSupply(
  erc721VotingToken: string | null,
  votingTokenChainId: number | null,
) {
  if (!erc721VotingToken) {
    return 0
  }

  if (votingTokenChainId !== base.id && votingTokenChainId !== mainnet.id) {
    throw new Error("Voting token chain id is not supported")
  }

  const client = votingTokenChainId === base.id ? l1Client : l2Client

  return client.readContract({
    abi: erc20Abi,
    address: getEthAddress(erc721VotingToken),
    functionName: "totalSupply",
  })
}
