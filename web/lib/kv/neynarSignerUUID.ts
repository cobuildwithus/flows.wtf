export interface SavedSignerUUID {
  fid: number
  signer_uuid: string
}

export function generateNeynarSignerKVKey(fid: number): string {
  return `neynar_signer:v1:${fid}`
}
