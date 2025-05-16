import { Vote } from "@prisma/flows"

export type UserVote = Pick<Vote, "bps" | "recipientId">

export type ERC721VotingToken = {
  contract: string
  tokenId: number
  owner: string
}
