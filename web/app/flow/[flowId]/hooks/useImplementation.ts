"use client"

import { nounsFlowImplAbi } from "@/lib/abis"
import { useReadContract } from "wagmi"

export function useImplementation(address: `0x${string}`) {
  const { data: implementation } = useReadContract({
    address,
    abi: nounsFlowImplAbi,
    functionName: "flowImpl",
  })

  return implementation?.toLowerCase()
}
