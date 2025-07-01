"use client"

import { cfav1Abi } from "@/lib/abis"
import { useContractTransaction } from "@/lib/wagmi/use-contract-transaction"
import { getCfaAddress } from "./addresses"

interface UseDeleteFlowProps {
  chainId: number
  superTokenAddress: `0x${string}`
  sender: `0x${string}` | undefined
  receiver: `0x${string}`
  onSuccess?: (hash: string) => void
}

export function useDeleteFlow({
  chainId,
  superTokenAddress,
  sender,
  receiver,
  onSuccess,
}: UseDeleteFlowProps) {
  const { prepareWallet, writeContract, isLoading, ...rest } = useContractTransaction({
    chainId,
    loading: "Deleting flow...",
    success: "Flow deleted successfully",
    onSuccess,
  })

  const deleteFlow = async () => {
    await prepareWallet()
    if (!sender) return

    writeContract({
      account: sender,
      address: getCfaAddress(chainId),
      abi: cfav1Abi,
      functionName: "deleteFlow",
      args: [superTokenAddress, sender, receiver, "0x"],
      chainId,
    })
  }

  return { deleteFlow, isLoading, ...rest }
}
