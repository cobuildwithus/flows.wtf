"use server"

import { superfluidPoolAbi } from "@/lib/abis"
import { getClient } from "@/lib/viem/client"
import { base } from "viem/chains"
import type { Address } from "viem"

export async function getClaimablePoolBalance(
  pool: Address | undefined,
  user: Address | undefined,
) {
  if (!pool || !user) {
    return BigInt(0)
  }

  try {
    const balance = await getClient(base.id).readContract({
      address: pool,
      abi: superfluidPoolAbi,
      functionName: "getClaimableNow",
      args: [user],
    })

    return balance?.length ? balance[0] : BigInt(0)
  } catch (error) {
    console.error("Error getting claimable pool balance:", error)
    return BigInt(0)
  }
}
