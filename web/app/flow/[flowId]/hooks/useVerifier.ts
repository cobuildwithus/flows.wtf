"use client"

import { nounsFlowImplAbi } from "@/lib/abis"
import { useReadContract } from "wagmi"

export function useVerifier(address: `0x${string}`) {
  const { data: verifier } = useReadContract({
    address,
    abi: nounsFlowImplAbi,
    functionName: "verifier",
  })

  return verifier?.toLowerCase()
}
