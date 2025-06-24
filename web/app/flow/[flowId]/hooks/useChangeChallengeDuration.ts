"use client"

import { flowTcrImplAbi, nounsFlowImplAbi } from "@/lib/abis"
import { useContractTransaction } from "@/lib/wagmi/use-contract-transaction"
import { toast } from "sonner"

export function useChangeChallengeDuration(address: `0x${string}`, chainId: number) {
  const { prepareWallet, writeContract, toastId } = useContractTransaction({
    chainId,
    success: "Challenge duration changed successfully",
  })

  const changeDuration = async (newDuration: number) => {
    try {
      await prepareWallet()

      writeContract({
        address,
        abi: flowTcrImplAbi,
        functionName: "changeTimeToChallenge",
        args: [BigInt(newDuration)],
        chainId,
      })
    } catch (e: any) {
      toast.error(e.message, { id: toastId })
    }
  }

  return {
    changeDuration,
  }
}
