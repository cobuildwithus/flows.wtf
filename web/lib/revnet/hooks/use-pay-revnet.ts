"use client"

import { toast } from "sonner"
import { parseEther } from "viem"
import { base } from "../../../addresses"
import { useContractTransaction } from "../../wagmi/use-contract-transaction"
import { jbMultiTerminalAbi } from "../../abis"

interface PayRevnetArgs {
  projectId: bigint
  token: `0x${string}`
  amount: string
  beneficiary: `0x${string}`
  minReturnedTokens?: bigint
  memo?: string
  metadata?: `0x${string}`
}

export function usePayRevnet(chainId: number, onSuccess?: () => void) {
  const { writeContract, prepareWallet, isLoading } = useContractTransaction({
    chainId,
    onSuccess,
    loading: "Processing payment...",
    success: "Payment successful!",
  })

  return {
    isLoading,
    payRevnet: async (args: PayRevnetArgs, account: `0x${string}`) => {
      try {
        await prepareWallet()

        const {
          projectId,
          token,
          amount,
          beneficiary,
          minReturnedTokens = 0n,
          memo = "",
          metadata = "0x0",
        } = args

        const isETH = token === "0x000000000000000000000000000000000000EEEe"
        const value = isETH ? parseEther(amount) : 0n
        const payAmount = isETH ? value : parseEther(amount)

        writeContract({
          account,
          address: base.JBMultiTerminal,
          abi: jbMultiTerminalAbi,
          functionName: "pay",
          chainId,
          args: [projectId, token, payAmount, beneficiary, minReturnedTokens, memo, metadata],
          value,
        })
      } catch (e) {
        console.error(e)
        return toast.error("Failed to process payment", {
          description: e instanceof Error ? e.message : "Unknown error",
        })
      }
    },
  }
}
