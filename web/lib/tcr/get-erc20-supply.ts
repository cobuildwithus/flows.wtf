"use server"

import { type Address, erc20Abi } from "viem"
import { l2Client } from "@/lib/viem/client"

export async function getERC20Supply(contract: Address) {
  try {
    const totalSupply = await l2Client.readContract({
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
