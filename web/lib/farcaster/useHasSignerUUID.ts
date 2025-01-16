"use client"

import useSWR from "swr"
import { hasSignerUUID } from "../auth/has-farcaster-signer-uuid"

interface Props {
  fid?: number
}

export function useHasSignerRegistered({ fid }: Props) {
  const { data: hasUUID, isLoading } = useSWR(fid ? ["has-signer-uuid", fid] : null, () =>
    hasSignerUUID(fid!),
  )

  return {
    hasSignerUUID: hasUUID ?? false,
    isLoading,
  }
}
