"use client"

import { nounsFlowImplAbi } from "@/lib/abis"
import { useReadContract } from "wagmi"
import { Address } from "viem"
import { getEthAddress } from "@/lib/utils"

export function useRecipientExists(flowTcr: string, address?: string) {
  const { data: recipientExists = false } = useReadContract({
    address: flowTcr as Address,
    abi: nounsFlowImplAbi,
    functionName: "recipientExists",
    args: address ? [getEthAddress(address)] : undefined,
    query: { enabled: !!address },
  })

  return recipientExists
}
