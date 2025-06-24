"use server"

import { tokenEmitterImplAbi } from "@/lib/abis"
import { getClient } from "@/lib/viem/client"
import type { Address } from "viem"

export async function getSellTokenQuote(contract: Address, amount: number, chainId: number) {
  try {
    const data = await getClient(chainId).readContract({
      abi: tokenEmitterImplAbi,
      address: contract,
      functionName: "sellTokenQuote",
      args: [BigInt(amount)],
    })

    return {
      payment: Number(data) || 0,
      isError: false,
    }
  } catch (error) {
    return {
      payment: 0,
      isError: true,
      error,
    }
  }
}
