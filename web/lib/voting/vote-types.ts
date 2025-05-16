import { mainnet } from "@/addresses"
import { Vote } from "@prisma/flows"

export type UserVote = Pick<Vote, "bps" | "recipientId">

export type ERC721VotingToken = {
  contract: string
  tokenId: number
  owner: string
}

export const isValidVotingContract = (contract: string | null) => {
  if (!contract) return false

  return contract.toLowerCase() === mainnet.NounsToken.toLowerCase()
}
