"use client"

import { nounsFlowImplAbi } from "@/lib/abis"
import { useContractTransaction } from "@/lib/wagmi/use-contract-transaction"
import { base } from "viem/chains"
import { toast } from "sonner"

export function useSetFlowImpl(address: `0x${string}`) {
  const { prepareWallet, writeContract, toastId } = useContractTransaction({
    chainId: base.id,
    success: "Flow implementation set",
  })

  const setFlowImpl = async (newImplementation: `0x${string}`) => {
    try {
      await prepareWallet()

      writeContract({
        address,
        abi: nounsFlowImplAbi,
        functionName: "setFlowImpl",
        args: [newImplementation],
        chainId: base.id,
      })
    } catch (e: any) {
      toast.error(e.message, { id: toastId })
    }
  }

  return {
    setFlowImpl,
  }
}
