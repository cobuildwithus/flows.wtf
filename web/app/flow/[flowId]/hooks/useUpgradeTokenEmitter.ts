"use client"

import { useContractTransaction } from "@/lib/wagmi/use-contract-transaction"
import { tokenEmitterImplAbi } from "@/lib/abis"
import { toast } from "sonner"

export const useUpgradeTokenEmitter = (
  tokenEmitterAddress?: `0x${string}`,
  chainId?: number,
) => {
  const { prepareWallet, writeContract, toastId } = useContractTransaction({
    chainId,
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
        chainId,
      })
    } catch (e: any) {
      toast.error(e.message, { id: toastId })
    }
  }

  return {
    upgradeTokenEmitter,
  }
}
