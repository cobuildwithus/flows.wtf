import { base, mainnet } from "@/addresses"
import { Vote } from "@prisma/flows"

export type UserAllocation = Pick<Vote, "bps" | "recipientId">

export type ERC721VotingToken = {
  contract: string
  tokenId: number
  owner: string
}

export const isValidVotingContract = (contract: string | null) => {
  if (!contract) return false

  return (
    contract.toLowerCase() === mainnet.NounsToken.toLowerCase() ||
    contract.toLowerCase() === base.VrbsToken.toLowerCase()
  )
}
