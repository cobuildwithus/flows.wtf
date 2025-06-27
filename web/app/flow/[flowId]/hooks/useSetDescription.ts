"use client"

import { customFlowImplAbi } from "@/lib/abis"
import { useContractTransaction } from "@/lib/wagmi/use-contract-transaction"
import { toast } from "sonner"

interface Props {
  contract: `0x${string}`
  chainId: number
  onSuccess?: (hash: string) => void
}

export function useSetDescription({ contract, chainId, onSuccess }: Props) {
  const { prepareWallet, writeContract, toastId, isLoading } = useContractTransaction({
    chainId,
    success: "Description updated!",
    loading: "Updating description...",
    onSuccess,
  })

  const setDescription = async (description: string) => {
    try {
      await prepareWallet()

      writeContract({
        address: contract,
        abi: customFlowImplAbi,
        functionName: "setDescription",
        args: [description],
        chainId,
      })
    } catch (e: any) {
      toast.error(e.message, { id: toastId })
    }
  }

  return {
    setDescription,
    isLoading,
  }
}
