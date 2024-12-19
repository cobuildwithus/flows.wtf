import { superfluidPoolAbi } from "@/lib/abis"
import { useAccount, useReadContract } from "wagmi"
import { base } from "viem/chains"

export const useClaimablePoolBalance = (pool: `0x${string}`) => {
  const { address } = useAccount()
  const chainId = base.id

  const {
    data: balance,
    isLoading,
    refetch,
  } = useReadContract({
    address: pool,
    abi: superfluidPoolAbi,
    chainId,
    functionName: "getClaimableNow",
    args: address ? [address] : undefined,
  })

  return {
    balance: balance?.length ? balance[0] : BigInt(0),
    isLoading,
    refetch,
  }
}
