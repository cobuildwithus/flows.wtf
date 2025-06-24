"use client"

import { nounsFlowImplAbi } from "@/lib/abis"
import { useContractTransaction } from "@/lib/wagmi/use-contract-transaction"
import { toast } from "sonner"

export function useSetFlowRate(address: `0x${string}`, chainId: number) {
  const { prepareWallet, writeContract, toastId } = useContractTransaction({
    chainId,
    success: "Flow rate updated successfully",
  })

  const setFlowRate = async (newFlowRate: number) => {
    try {
      await prepareWallet()

      writeContract({
        address,
        abi: nounsFlowImplAbi,
        functionName: "setFlowRate",
        args: [BigInt(newFlowRate)],
        chainId,
      })
    } catch (e: any) {
      toast.error(e.message, { id: toastId })
    }
  }

  return {
    setFlowRate,
  }
}
