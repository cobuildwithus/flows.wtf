"use server"

import { getDecryptedItem } from "../kv/kvStore"
import { generateNeynarSignerKVKey } from "../kv/neynarSignerUUID"

export async function getSignerData(fid: number) {
  return await getDecryptedItem<{
    fid: number
    signer_uuid: string
    signer_permissions: string[]
  }>(generateNeynarSignerKVKey(fid))
}

export async function getSignerUUID(fid: number) {
  const data = await getSignerData(fid)
  return data?.signer_uuid || null
}

export const hasSignerUUID = async (fid: number) => {
  const signerUUID = await getSignerUUID(fid)
  return signerUUID !== null && signerUUID !== undefined
}
