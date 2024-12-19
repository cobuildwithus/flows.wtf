export enum Party {
  None, // Party per default when there is no challenger or requester. Also used for inconclusive ruling.
  Requester, // Party that made the request to change a status.
  Challenger, // Party that challenges the request to change a status.
}
export interface SavedVote {
  choice: Party
  reason: string
  disputeId: number
  voter: `0x${string}`
  salt: `0x${string}`
  commitHash: `0x${string}`
}

export function generateSalt(): `0x${string}` {
  const randomBytes = new Uint8Array(32)
  crypto.getRandomValues(randomBytes)
  return `0x${Buffer.from(randomBytes).toString("hex")}` as `0x${string}`
}

export function generateKVKey(
  arbitrator: string,
  disputeId: string,
  address: string,
  commitHash: string,
): string {
  // guaranteed to be unique across disputes since you can only vote once per dispute per arbitrator per address
  return `vote:${arbitrator.toLowerCase()}:${disputeId}:${address.toLowerCase()}:${commitHash}`
}
