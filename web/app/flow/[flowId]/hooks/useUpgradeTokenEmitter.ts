"use client"

import { useContractTransaction } from "@/lib/wagmi/use-contract-transaction"
import { tokenEmitterImplAbi } from "@/lib/abis"
import { base } from "viem/chains"
import { toast } from "sonner"

export const useUpgradeTokenEmitter = (tokenEmitterAddress?: `0x${string}`) => {
  const { prepareWallet, writeContract, toastId } = useContractTransaction({
    chainId: base.id,
    success: "Token emitter changed successfully",
  })

  const upgradeTokenEmitter = async (tokenEmitter: `0x${string}`) => {
    try {
      await prepareWallet()

      if (!tokenEmitterAddress) throw new Error("Token emitter address is required")

      writeContract({
        address: tokenEmitterAddress,
        abi: tokenEmitterImplAbi,
        functionName: "upgradeTo",
        args: [tokenEmitter],
        chainId: base.id,
      })
    } catch (e: any) {
      toast.error(e.message, { id: toastId })
    }
  }

  return {
    upgradeTokenEmitter,
  }
}
