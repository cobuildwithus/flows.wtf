"use client"

import { nounsFlowImplAbi } from "@/lib/abis"
import { useContractTransaction } from "@/lib/wagmi/use-contract-transaction"
import { toast } from "sonner"

export function useUpdateVerifier(address: `0x${string}`, chainId: number) {
  const { prepareWallet, writeContract, toastId } = useContractTransaction({
    chainId,
    success: "Flow verifier updated successfully",
  })

  const update = async (newVerifier: `0x${string}`) => {
    try {
      await prepareWallet()

      writeContract({
        address,
        abi: nounsFlowImplAbi,
        functionName: "updateVerifier",
        args: [newVerifier],
        chainId,
      })
    } catch (e: any) {
      toast.error(e.message, { id: toastId })
    }
  }

  return {
    update,
  }
}
