"use client"

import { nounsFlowImplAbi } from "@/lib/abis"
import { useContractTransaction } from "@/lib/wagmi/use-contract-transaction"
import { base } from "viem/chains"
import { toast } from "sonner"

export function useUpgradeTo(address: `0x${string}`) {
  const { prepareWallet, writeContract, toastId } = useContractTransaction({
    chainId: base.id,
    success: "Flow implementation upgraded successfully",
  })

  const upgrade = async (newImplementation: `0x${string}`) => {
    try {
      await prepareWallet()

      writeContract({
        address,
        abi: nounsFlowImplAbi,
        functionName: "upgradeTo",
        args: [newImplementation],
        chainId: base.id,
      })
    } catch (e: any) {
      toast.error(e.message, { id: toastId })
    }
  }

  return {
    upgrade,
  }
}
