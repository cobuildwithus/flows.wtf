"use client"

import useSWR from "swr"
import { getClaimableBalance } from "./get-claimable-balance"

export const useClaimableFlowsBalance = (contract: `0x${string}`, builder: `0x${string}`) => {
  const { data: balance, isLoading } = useSWR(
    contract && builder ? [`${contract}_${builder}_balance`] : null,
    () => getClaimableBalance(contract, builder),
  )

  return {
    balance: balance || BigInt(0),
    isLoading,
  }
}
