"use server"

import { type Address, erc20Abi } from "viem"
import { unstable_cache } from "next/cache"
import { getClient } from "@/lib/viem/client"

async function _getERC20Supply(contract: Address, chainId: number) {
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

const getCachedERC20Supply = unstable_cache(_getERC20Supply, ["erc20-supply"], {
  revalidate: 300, // 5 minutes
})

export async function getERC20Supply(contract: Address | undefined, chainId: number) {
  if (!contract) {
    return 0
  }

  return getCachedERC20Supply(contract, chainId)
}
