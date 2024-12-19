"use client"

import { nounsFlowImplAbi } from "@/lib/abis"
import { useContractTransaction } from "@/lib/wagmi/use-contract-transaction"
import { base } from "viem/chains"
import { toast } from "sonner"

export function useSetFlowRate(address: `0x${string}`) {
  const { prepareWallet, writeContract, toastId } = useContractTransaction({
    chainId: base.id,
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
        chainId: base.id,
      })
    } catch (e: any) {
      toast.error(e.message, { id: toastId })
    }
  }

  return {
    setFlowRate,
  }
}
