import "server-only"
import { bytesToHex } from "viem"

/**
 * Generates a proof for the execution state root within a beacon block
 * @param block - The beacon block
 * @returns An object containing the proof and leaf (execution state root)
 */
export async function getExecutionStateRootProof(block: any) {
  const { ssz } = await import("@lodestar/types")
  const { BeaconBlock } = ssz.deneb
  const { createProof, ProofType } = await import("@chainsafe/persistent-merkle-tree")

  // Convert the block to a view object for easier manipulation
  const blockView = BeaconBlock.toView(block)

  // Get the path information for the state root within the block structure
  const path = blockView.type.getPathInfo(["body", "executionPayload", "stateRoot"])

  // Create a proof for the state root
  const proofObj = createProof(blockView.node, {
    type: ProofType.single,
    gindex: path.gindex,
  }) as any

  // Convert the proof witnesses and leaf to hexadecimal strings
  const proof = proofObj.witnesses.map((w: Uint8Array) => bytesToHex(w))
  const leaf = bytesToHex(proofObj.leaf as Uint8Array)

  return { proof, leaf }
}
