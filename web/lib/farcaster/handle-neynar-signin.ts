"use server"

import { saveOrGetEncrypted, deleteItem } from "../kv/kvStore"
import { generateNeynarSignerKVKey } from "../kv/neynarSignerUUID"
import { saveNewVerifiedAddress } from "./save-new-verified-address"

export const handleNeynarSignin = async (
  fid: number,
  signer_uuid: string,
  signer_permissions: string[],
  userAddress: `0x${string}`,
) => {
  const key = generateNeynarSignerKVKey(fid)
  await deleteItem(key)
  await saveOrGetEncrypted(key, {
    fid,
    signer_uuid,
    signer_permissions,
  })

  await saveNewVerifiedAddress(fid, userAddress)
}
