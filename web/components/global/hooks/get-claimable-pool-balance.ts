"use server"

import { superfluidPoolAbi } from "@/lib/abis"
import { l2Client } from "@/lib/viem/client"
import type { Address } from "viem"

export async function getClaimablePoolBalance(
  pool: Address | undefined,
  user: Address | undefined,
) {
  if (!pool || !user) {
    return BigInt(0)
  }

  try {
    const balance = await l2Client.readContract({
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
