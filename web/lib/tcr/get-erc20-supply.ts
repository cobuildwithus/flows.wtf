"use server"

import { type Address, erc20Abi } from "viem"
import { getClient } from "@/lib/viem/client"
import { base } from "viem/chains"

export async function getERC20Supply(contract: Address | undefined) {
  if (!contract) {
    return 0
  }

  try {
    const totalSupply = await getClient(base.id).readContract({
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
