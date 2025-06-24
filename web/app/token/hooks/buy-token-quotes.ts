"use server"

import { tokenEmitterImplAbi } from "@/lib/abis"
import { getClient } from "@/lib/viem/client"
import type { Address } from "viem"
import { base } from "viem/chains"

export async function getTokenQuote(contract: Address, amount: bigint, chainId = base.id) {
  try {
    const data = await getClient(chainId).readContract({
      abi: tokenEmitterImplAbi,
      address: contract,
      functionName: "buyTokenQuote",
      args: [amount],
    })

    return {
      totalCost: Number(data[0]) || 0,
      addedSurgeCost: Number(data[1]) || 0,
      isError: false,
    }
  } catch (error) {
    return {
      totalCost: 0,
      addedSurgeCost: 0,
      isError: true,
      error,
    }
  }
}

export async function getTokenQuoteWithRewards(
  contract: Address,
  amount: bigint,
  chainId = base.id,
) {
  try {
    const data = await getClient(chainId).readContract({
      abi: tokenEmitterImplAbi,
      address: contract,
      functionName: "buyTokenQuoteWithRewards",
      args: [amount],
    })

    return {
      totalCost: Number(data[0]) || 0,
      addedSurgeCost: Number(data[1]) || 0,
      isError: false,
    }
  } catch (error) {
    return {
      totalCost: 0,
      addedSurgeCost: 0,
      isError: true,
      error,
    }
  }
}
