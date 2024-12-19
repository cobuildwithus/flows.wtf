"use client"

import { cfav1ForwarderAbi, nounsFlowImplAbi, superfluidPoolAbi } from "@/lib/abis"
import { useContractTransaction } from "@/lib/wagmi/use-contract-transaction"
import { base } from "viem/chains"
import { toast } from "sonner"

export function useSetBaselinePoolPercent(address: `0x${string}`) {
  const { prepareWallet, writeContract, toastId } = useContractTransaction({
    chainId: base.id,
    success: "Baseline pool percent updated successfully",
  })

  const setBaselinePoolPercent = async (newPercent: number) => {
    try {
      await prepareWallet()

      writeContract({
        address,
        abi: [...nounsFlowImplAbi, ...superfluidPoolAbi, ...cfav1ForwarderAbi],
        functionName: "setBaselineFlowRatePercent",
        args: [newPercent],
        chainId: base.id,
      })
    } catch (e: any) {
      toast.error(e.message, { id: toastId })
    }
  }

  return {
    setBaselinePoolPercent,
  }
}
