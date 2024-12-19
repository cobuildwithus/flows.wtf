import { nounsFlowImplAbi } from "@/lib/abis"
import { l2Client } from "@/lib/viem/client"
import { getContract } from "viem"

export async function getOwner(address: `0x${string}`) {
  const contract = getContract({ address, abi: nounsFlowImplAbi, client: l2Client })

  const owner = await contract.read.owner()
  return owner as `0x${string}`
}
