import "server-only"

const BEACON_API_URL = `${process.env.BEACON_API_URL}`

/**
 * Fetches a beacon block from the Beacon API
 * @param tag - The block identifier (e.g., slot number, block root, or "head")
 * @returns The deserialized beacon block message
 */
export async function getBeaconBlock(tag: string) {
  const { ssz } = await import("@lodestar/types")
  const { SignedBeaconBlock } = ssz.deneb

  // Fetch the block from the Beacon API
  const resp = await fetch(`${BEACON_API_URL}/eth/v2/beacon/blocks/${tag}`, {
    headers: { Accept: "application/octet-stream" },
  })

  // Handle potential errors
  // Uncomment the following line to handle 404 errors specifically
  // if (resp.status == 404) throw new Error(`Missing block ${tag}`);
  if (resp.status !== 200) {
    throw new Error(`Error fetching block ${tag}: ${await resp.text()}`)
  }

  // Deserialize the response into a SignedBeaconBlock
  const raw = new Uint8Array(await resp.arrayBuffer())
  const signedBlock = SignedBeaconBlock.deserialize(raw)

  // Return the block message (without the signature)
  return signedBlock.message
}
