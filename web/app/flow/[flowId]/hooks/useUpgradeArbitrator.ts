"use client"

import { useContractTransaction } from "@/lib/wagmi/use-contract-transaction"
import { erc20VotesArbitratorImplAbi, flowTcrImplAbi } from "@/lib/abis"
import { toast } from "sonner"

export const useUpgradeArbitrator = (arbitratorAddress?: `0x${string}`, chainId?: number) => {
  const { prepareWallet, writeContract, toastId } = useContractTransaction({
    chainId,
    success: "Arbitrator changed successfully",
  })

  const upgradeArbitrator = async (arbitrator: `0x${string}`) => {
    try {
      await prepareWallet()

      if (!arbitratorAddress) throw new Error("Arbitrator address is required")

      writeContract({
        address: arbitratorAddress,
        abi: erc20VotesArbitratorImplAbi,
        functionName: "upgradeTo",
        args: [arbitrator],
        chainId,
      })
    } catch (e: any) {
      toast.error(e.message, { id: toastId })
    }
  }

  return {
    upgradeArbitrator,
  }
}
