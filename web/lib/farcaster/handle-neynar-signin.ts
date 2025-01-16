"use server"

import { saveOrGetEncrypted } from "../kv/kvStore"
import { generateNeynarSignerKVKey } from "../kv/neynarSignerUUID"
import { saveNewVerifiedAddress } from "./save-new-verified-address"

export const handleNeynarSignin = async (
  fid: number,
  signer_uuid: string,
  signer_permissions: string[],
  userAddress: `0x${string}`,
) => {
  await saveOrGetEncrypted(generateNeynarSignerKVKey(fid), {
    fid,
    signer_uuid,
    signer_permissions,
  })

  await saveNewVerifiedAddress(fid, userAddress)
}
