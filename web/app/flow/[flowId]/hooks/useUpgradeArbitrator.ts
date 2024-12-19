"use client"

import { useContractTransaction } from "@/lib/wagmi/use-contract-transaction"
import { erc20VotesArbitratorImplAbi, flowTcrImplAbi } from "@/lib/abis"
import { base } from "viem/chains"
import { toast } from "sonner"

export const useUpgradeArbitrator = (arbitratorAddress?: `0x${string}`) => {
  const { prepareWallet, writeContract, toastId } = useContractTransaction({
    chainId: base.id,
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
        chainId: base.id,
      })
    } catch (e: any) {
      toast.error(e.message, { id: toastId })
    }
  }

  return {
    upgradeArbitrator,
  }
}
