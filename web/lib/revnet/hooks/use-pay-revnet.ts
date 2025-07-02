"use client"

import { toast } from "sonner"
import { parseEther } from "viem"
import { base } from "../../../addresses"
import { useContractTransaction } from "../../wagmi/use-contract-transaction"
import { jbMultiTerminalAbi, jbDirectoryAbi } from "../../abis"
import { useReadContract } from "wagmi"

interface PayRevnetArgs {
  projectId: bigint
  token: `0x${string}`
  amount: string
  beneficiary: `0x${string}`
  minReturnedTokens?: bigint
  memo?: string
  metadata?: `0x${string}`
}

const ETH_ADDRESS = "0x000000000000000000000000000000000000EEEe" as const

export function usePayRevnet(projectId: bigint, chainId: number, onSuccess?: () => void) {
  const { writeContract, prepareWallet, isLoading } = useContractTransaction({
    chainId,
    onSuccess,
    loading: "Processing payment...",
    success: "Payment successful!",
  })

  // Fetch the primary terminal for this project
  const { data: primaryTerminal } = useReadContract({
    address: base.JBDirectory,
    abi: jbDirectoryAbi,
    functionName: "primaryTerminalOf",
    args: [projectId, ETH_ADDRESS],
    chainId,
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

        const isETH = token === ETH_ADDRESS
        const value = isETH ? parseEther(amount) : 0n
        const payAmount = isETH ? value : parseEther(amount)

        // Use fetched terminal or fallback to default JBMultiTerminal
        const paymentTerminal = primaryTerminal || base.JBMultiTerminal

        writeContract({
          account,
          address: paymentTerminal,
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

// Export for other uses if needed
export function usePrimaryNativeTerminal(projectId: bigint, chainId: number) {
  const result = useReadContract({
    address: base.JBDirectory,
    abi: jbDirectoryAbi,
    functionName: "primaryTerminalOf",
    args: [projectId, ETH_ADDRESS],
    chainId,
  })

  return result
}
