"use client"

import { customFlowImplAbi } from "@/lib/abis"
import { useContractTransaction } from "@/lib/wagmi/use-contract-transaction"
import { toast } from "sonner"

interface Props {
  contract: `0x${string}`
  chainId: number
  onSuccess?: (hash: string) => void
}

export function useSetMetadata({ contract, chainId, onSuccess }: Props) {
  const { prepareWallet, writeContract, toastId, isLoading } = useContractTransaction({
    chainId,
    success: "Metadata updated!",
    loading: "Updating metadata...",
    onSuccess,
  })

  const setMetadata = async (metadata: {
    title: string
    description: string
    image: string
    tagline: string
    url: string
  }) => {
    try {
      await prepareWallet()

      writeContract({
        address: contract,
        abi: customFlowImplAbi,
        functionName: "setMetadata",
        args: [metadata],
        chainId,
      })
    } catch (e: any) {
      toast.error(e.message, { id: toastId })
    }
  }

  return {
    setMetadata,
    isLoading,
  }
}
