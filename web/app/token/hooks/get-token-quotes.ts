import { tokenEmitterImplAbi } from "@/lib/abis"
import { Address, createPublicClient, http } from "viem"
import { base } from "viem/chains"

const publicClient = createPublicClient({
  chain: base,
  transport: http(),
})

export async function getTokenQuote(contract: Address, amount: bigint, chainId = base.id) {
  try {
    const data = await publicClient.readContract({
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
    const data = await publicClient.readContract({
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
