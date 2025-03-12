"use server"

import { superfluidPoolAbi } from "@/lib/abis"
import { l2Client } from "@/lib/viem/client"
import type { Address } from "viem"
import { base } from "viem/chains"

export async function getClaimablePoolBalance(pool: Address, user: Address) {
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
