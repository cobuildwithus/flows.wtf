import { base as baseContracts } from "../addresses"
import { nounsTokenAddress } from "./abis"

// Flow contracts
export const NOUNS_FLOW = baseContracts.NounsFlow

// Nouns token contract (for voting power)
export const NOUNS_TOKEN = (process.env.NEXT_PUBLIC_NOUNS_TOKEN_ADDRESS ||
  nounsTokenAddress[1]) as `0x${string}`

// x Noun = x * VOTING_POWER_SCALE votes
export const VOTING_POWER_SCALE = BigInt(1000)

// Voting scale from the contract
export const PERCENTAGE_SCALE = 1e6

// Subgraph ID
export const NOUNS_SUBGRAPH_ID = "5qcR6rAfDMZCVGuZ6DDois7y4zyXqsyqvaqhE6NRRraW"

// Macro forwarder address (same across all chains)
export const MACRO_FORWARDER = "0xfD01285b9435bc45C243E5e7F978E288B2912de6" as `0x${string}`

// Bulk withdraw macro address (same across all chains)
export const BULK_WITHDRAW_MACRO = "0xd391e17927b1560d6847f90bc3d58b7f95122c9a" as `0x${string}`

// Max voting power for a user (limit # of nouns to vote with)
export const MAX_VOTING_POWER = BigInt(6000)

// Farcaster Channel IDs
export const NOUNS_CHANNEL_URL =
  "chain://eip155:1/erc721:0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03"
export const FLOWS_CHANNEL_URL = "https://warpcast.com/~/channel/flows"

export const NOUNS_CHANNEL_ID = "nouns"
export const FLOWS_CHANNEL_ID = "flows"

export const MULTICALL_ADDRESS = "0xcA11bde05977b3631167028862bE2a173976CA11" as `0x${string}`

export const MAX_GRANTS_PER_USER = 2
