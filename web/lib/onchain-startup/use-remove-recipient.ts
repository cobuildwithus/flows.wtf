"use client"

import { toast } from "sonner"
import { useContractTransaction } from "../wagmi/use-contract-transaction"
import { selfManagedFlowImplAbi } from "../abis"
import { useAccount } from "wagmi"

interface PayRevnetArgs {
  recipientId: string
  contract: `0x${string}`
}

export function useRemoveRecipient(chainId: number, onSuccess?: () => void) {
  const { address: account } = useAccount()

  const { writeContract, prepareWallet, isLoading } = useContractTransaction({
    chainId,
    onSuccess,
    loading: "Removing recipient...",
    success: "Recipient removed!",
  })

  return {
    isLoading,
    removeRecipient: async (args: PayRevnetArgs) => {
      try {
        await prepareWallet()

        const { recipientId, contract } = args

        writeContract({
          account,
          address: contract,
          abi: selfManagedFlowImplAbi,
          functionName: "removeRecipient",
          chainId,
          args: [recipientId as `0x${string}`],
        })
      } catch (e) {
        console.error(e)
        return toast.error("Failed to remove recipient", {
          description: e instanceof Error ? e.message : "Unknown error",
        })
      }
    },
  }
}
