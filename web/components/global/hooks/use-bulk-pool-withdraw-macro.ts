import { useContractTransaction } from "@/lib/wagmi/use-contract-transaction"
import { superfluidMacroForwarderAbi } from "@/lib/abis"
import { useAccount } from "wagmi"
import { base } from "viem/chains"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { BULK_WITHDRAW_MACRO, MACRO_FORWARDER } from "@/lib/config"
import { encodeAbiParameters } from "viem"

export const useBulkPoolWithdrawMacro = (pools: `0x${string}`[], onSuccess?: () => void) => {
  const { address } = useAccount()
  const router = useRouter()
  const chainId = base.id

  const { prepareWallet, writeContract, isLoading, toastId } = useContractTransaction({
    chainId,
    success: "Earnings withdrawn!",
    onSuccess: (hash) => {
      // Handle successful withdrawal here if needed
      router.refresh()
      onSuccess?.()
    },
  })

  const withdraw = async () => {
    if (!address) {
      toast.error("Wallet not connected")
      return
    }

    try {
      await prepareWallet()
      const args = encodeAbiParameters([{ type: "address[]", name: "pools" }], [pools])

      writeContract({
        account: address,
        address: MACRO_FORWARDER,
        abi: superfluidMacroForwarderAbi,
        chainId,
        functionName: "runMacro",
        args: [BULK_WITHDRAW_MACRO, args],
      })
    } catch (e: any) {
      toast.error(e.message, { id: toastId })
    }
  }

  return {
    withdraw,
    isLoading,
  }
}
