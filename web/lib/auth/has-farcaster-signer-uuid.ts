"use server"

import { getDecryptedItem } from "../kv/kvStore"
import { generateNeynarSignerKVKey } from "../kv/neynarSignerUUID"

export const hasSignerUUID = async (fid: number) => {
  const signerUUID = await getDecryptedItem(generateNeynarSignerKVKey(fid))
  return signerUUID !== null
}
