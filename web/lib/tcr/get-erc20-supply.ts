"use server"

import { type Address, erc20Abi } from "viem"
import { getClient } from "@/lib/viem/client"

export async function getERC20Supply(contract: Address | undefined, chainId: number) {
  if (!contract) {
    return 0
  }

  try {
    const totalSupply = await getClient(chainId).readContract({
      abi: erc20Abi,
      address: contract,
      functionName: "totalSupply",
    })

    return Number(totalSupply) || 0
  } catch (error) {
    console.error("Error getting ERC20 total supply:", error)
    return 0
  }
}
