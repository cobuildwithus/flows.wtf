import { Button } from "@/components/ui/button"
import { tokenEmitterImplAbi } from "@/lib/abis"
import { useContractTransaction } from "@/lib/wagmi/use-contract-transaction"
import { Address } from "viem"
import { base } from "viem/chains"
import { useAccount } from "wagmi"
import { toast } from "sonner"

const chainId = base.id

export const SellTokenButton = ({
  isLoadingQuote,
  isError,
  tokenBalance,
  tokenAmountBigInt,
  payment,
  onSuccess,
  tokenSymbol,
  tokenEmitter,
}: {
  isLoadingQuote: boolean
  tokenBalance: bigint
  isError: boolean
  tokenAmountBigInt: bigint
  payment: bigint
  onSuccess: (hash: string) => void
  tokenSymbol: string
  tokenEmitter: Address
}) => {
  const { address } = useAccount()
  const { prepareWallet, writeContract, toastId, isLoading } = useContractTransaction({
    chainId,
    success: "Tokens sold successfully!",
    onSuccess: async (hash) => {
      onSuccess(hash)
    },
  })

  return (
    <Button
      className="w-full rounded-2xl py-7 text-lg font-medium tracking-wide"
      disabled={
        isLoading || isLoadingQuote || isError || !tokenBalance || tokenBalance < tokenAmountBigInt
      }
      loading={isLoading}
      type="button"
      onClick={async () => {
        try {
          await prepareWallet()

          const minPaymentWithSlippage = BigInt(Math.trunc(Number(payment) * 0.98))

          writeContract({
            account: address,
            abi: tokenEmitterImplAbi,
            functionName: "sellToken",
            address: tokenEmitter,
            chainId,
            args: [tokenAmountBigInt, minPaymentWithSlippage],
          })
        } catch (e: any) {
          toast.error(e.message, { id: toastId })
        }
      }}
    >
      {tokenBalance < tokenAmountBigInt ? `Insufficient ${tokenSymbol} balance` : "Sell"}
    </Button>
  )
}
