import { Address, erc20Abi } from "viem"
import { base } from "viem/chains"
import { useReadContract } from "wagmi"

export function useERC20Supply(contract: Address, chainId = base.id) {
  const { data: totalSupply, isLoading } = useReadContract({
    abi: erc20Abi,
    address: contract,
    chainId,
    functionName: "totalSupply",
  })

  return {
    totalSupply: totalSupply || BigInt(0),
    isLoading,
  }
}
