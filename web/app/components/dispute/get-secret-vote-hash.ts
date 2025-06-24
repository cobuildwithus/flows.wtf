import { generateKVKey, generateSalt, Party, SavedVote } from "@/lib/kv/disputeVote"
import { saveOrGetEncrypted } from "@/lib/kv/kvStore"
import { encodeAbiParameters, keccak256 } from "viem"

function generateCommitment(party: Party): { commitHash: `0x${string}`; salt: `0x${string}` } {
  try {
    const salt = generateSalt()
    const commitHash = keccak256(
      encodeAbiParameters(
        [{ type: "uint256" }, { type: "string" }, { type: "bytes32" }],
        [BigInt(party), "", salt],
      ),
    )

    return { commitHash, salt }
  } catch (error) {
    console.error("Error generating commitment:", error)
    throw error
  }
}

export async function generateVoteHash(
  party: Party,
  arbitrator: string,
  disputeId: string,
  address: string,
  chainId: number,
) {
  try {
    const { commitHash, salt } = generateCommitment(party)

    const key = generateKVKey(arbitrator, disputeId, address, commitHash)
    const data: SavedVote = {
      chainId,
      choice: party,
      reason: "",
      disputeId: parseInt(disputeId),
      voter: address.toLowerCase() as `0x${string}`,
      salt,
      commitHash,
    }

    // pull if already saved, otherwise save
    const vote = await saveOrGetEncrypted(key, data)
    return vote.commitHash
  } catch (error) {
    console.error(`Error generating vote hash for party ${party}:`, error)
    throw error
  }
}
