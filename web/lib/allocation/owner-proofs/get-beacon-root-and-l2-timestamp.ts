import "server-only"
import type { Block, Hex, PublicClient } from "viem"

// Extend the Block type to include the parentBeaconBlockRoot property specific to L2 blocks
type L2Block = Block & { parentBeaconBlockRoot: Hex }

// Define the return type for the getBeaconRootAndL2Timestamp function
type GetBeaconRootAndL2TimestampReturnType = {
  beaconRoot: Hex
  timestampForL2BeaconOracle: bigint
}

/**
 * Retrieves the beacon root and L2 timestamp from the latest L2 block
 * @param l2ChainPublicClient - The public client for interacting with the L2 chain
 * @returns An object containing the beacon root and L2 timestamp
 */
export async function getBeaconRootAndL2Timestamp(
  l2ChainPublicClient: PublicClient,
): Promise<GetBeaconRootAndL2TimestampReturnType> {
  // Fetch the latest block from the L2 chain
  const block = (await l2ChainPublicClient.getBlock()) as L2Block

  // Extract and return the required information from the block
  return {
    beaconRoot: block.parentBeaconBlockRoot,
    timestampForL2BeaconOracle: block.timestamp,
  }
}
