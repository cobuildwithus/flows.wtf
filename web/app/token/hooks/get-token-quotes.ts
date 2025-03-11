"use server"

import { tokenEmitterImplAbi } from "@/lib/abis"
import { l2Client } from "@/lib/viem/client"
import { Address } from "viem"
import { base } from "viem/chains"

export async function getTokenQuote(contract: Address, amount: bigint, chainId = base.id) {
  try {
    const data = await l2Client.readContract({
      abi: tokenEmitterImplAbi,
      address: contract,
      functionName: "buyTokenQuote",
      args: [amount],
    })

    return {
      totalCost: data[0] || BigInt(0),
      addedSurgeCost: data[1] || BigInt(0),
      isError: false,
    }
  } catch (error) {
    return {
      totalCost: BigInt(0),
      addedSurgeCost: BigInt(0),
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
    const data = await l2Client.readContract({
      abi: tokenEmitterImplAbi,
      address: contract,
      functionName: "buyTokenQuoteWithRewards",
      args: [amount],
    })

    return {
      totalCost: data[0] || BigInt(0),
      addedSurgeCost: data[1] || BigInt(0),
      isError: false,
    }
  } catch (error) {
    return {
      totalCost: BigInt(0),
      addedSurgeCost: BigInt(0),
      isError: true,
      error,
    }
  }
}
