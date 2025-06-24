import { nounsFlowImplAbi } from "@/lib/abis"
import { getClient } from "@/lib/viem/client"
import { getContract } from "viem"
import { base } from "viem/chains"

export async function getOwner(address: `0x${string}`) {
  const contract = getContract({
    address,
    abi: nounsFlowImplAbi,
    client: getClient(base.id),
  })

  const owner = await contract.read.owner()
  return owner as `0x${string}`
}
