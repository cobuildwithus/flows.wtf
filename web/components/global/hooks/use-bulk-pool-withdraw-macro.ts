import { superfluidMacroForwarderAbi } from "@/lib/abis"
import { BULK_WITHDRAW_MACRO, MACRO_FORWARDER } from "@/lib/config"
import { useContractTransaction } from "@/lib/wagmi/use-contract-transaction"
import { toast } from "sonner"
import { encodeAbiParameters } from "viem"
import { base } from "viem/chains"
import { useAccount } from "wagmi"
import { useUserTcrTokens } from "../curator-popover/hooks/use-user-tcr-tokens"

export const useBulkPoolWithdrawMacro = (pools: `0x${string}`[], onSuccess?: () => void) => {
  const { address } = useAccount()
  const chainId = base.id
  const { mutateEarnings } = useUserTcrTokens(address)

  const { prepareWallet, writeContract, isLoading, toastId } = useContractTransaction({
    chainId,
    success: "Earnings withdrawn!",
    onSuccess: (hash) => {
      mutateEarnings()
      onSuccess?.()
    },
  })

  const withdraw = async () => {
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
