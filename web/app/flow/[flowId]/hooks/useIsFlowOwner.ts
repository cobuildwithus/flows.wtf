"use client"

import { useAccount } from "wagmi"
import { getOwner } from "./get-owner"
import useSWR from "swr"

export function useIsFlowOwner(address: `0x${string}`) {
  const { address: userAddress } = useAccount()

  const { data: owner } = useSWR(address ? `${address}_owner` : null, () => getOwner(address))

  return owner && owner?.toLowerCase() === userAddress?.toLowerCase()
}
