import { superfluidMacroForwarderAbi } from "@/lib/abis"
import { getBulkWithdrawMacro, MACRO_FORWARDER } from "@/lib/config"
import { useContractTransaction } from "@/lib/wagmi/use-contract-transaction"
import { toast } from "sonner"
import { encodeAbiParameters } from "viem"
import { useAccount } from "wagmi"
import { useUserTcrTokens } from "../curator-popover/hooks/use-user-tcr-tokens"

export const useBulkPoolWithdrawMacro = (
  pools: `0x${string}`[],
  chainId: number,
  onSuccess?: () => void,
) => {
  const { address } = useAccount()
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
      const encodedArgs = encodeAbiParameters([{ type: "address[]", name: "pools" }], [pools])

      const bulkWithdrawMacro = getBulkWithdrawMacro(chainId)

      writeContract({
        account: address,
        address: MACRO_FORWARDER,
        abi: superfluidMacroForwarderAbi,
        chainId,
        functionName: "runMacro",
        args: [bulkWithdrawMacro, encodedArgs],
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
