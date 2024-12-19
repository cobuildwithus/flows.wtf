"use client"

import { flowTcrImplAbi, nounsFlowImplAbi } from "@/lib/abis"
import { useContractTransaction } from "@/lib/wagmi/use-contract-transaction"
import { base } from "viem/chains"
import { toast } from "sonner"

export function useChangeChallengeDuration(address: `0x${string}`) {
  const { prepareWallet, writeContract, toastId } = useContractTransaction({
    chainId: base.id,
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
        chainId: base.id,
      })
    } catch (e: any) {
      toast.error(e.message, { id: toastId })
    }
  }

  return {
    changeDuration,
  }
}
