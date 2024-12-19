import { Button } from "@/components/ui/button"
import { tokenEmitterImplAbi } from "@/lib/abis"
import { getEthAddress } from "@/lib/utils"
import { useContractTransaction } from "@/lib/wagmi/use-contract-transaction"
import { useWaitForTransactions } from "@/lib/wagmi/use-wait-for-transactions"
import { RelayChain } from "@reservoir0x/relay-sdk"
import { toast } from "sonner"
import { Address, zeroAddress } from "viem"
import { base } from "viem/chains"
import { useAccount, useBalance } from "wagmi"
import { useBuyTokenRelay } from "./hooks/use-buy-token-relay"

const toChainId = base.id

export const BuyTokenButton = ({
  onSuccess,
  tokenEmitter,
  costWithRewardsFee,
  tokenAmountBigInt,
  isLoadingRewardsQuote,
  selectedChain,
}: {
  onSuccess: (hash: string) => void
  tokenEmitter: Address
  costWithRewardsFee: bigint
  tokenAmountBigInt: bigint
  isLoadingRewardsQuote: boolean
  selectedChain: RelayChain
}) => {
  const chainId = selectedChain.id
  const successMessage = "Tokens bought successfully!"
  const { address } = useAccount()
  const { data: balance } = useBalance({ address, chainId })

  const { executeBuyTokenRelay, txHashes } = useBuyTokenRelay()

  const { prepareWallet, writeContract, isLoading, toastId } = useContractTransaction({
    chainId,
    success: successMessage,
    onSuccess: async (hash) => {
      onSuccess(hash)
    },
  })
  useWaitForTransactions(txHashes, toastId)

  const insufficientBalance =
    balance && balance.value < BigInt(Math.trunc(Number(costWithRewardsFee) * 1.05))

  return (
    <Button
      className="w-full rounded-2xl py-7 text-lg font-medium tracking-wide"
      disabled={isLoading || isLoadingRewardsQuote || !balance || insufficientBalance}
      loading={isLoading}
      type="button"
      onClick={async () => {
        try {
          await prepareWallet(toastId)

          const costWithSlippage = BigInt(Math.trunc(Number(costWithRewardsFee) * 1.02))

          const args: [Address, bigint, bigint, { builder: Address; purchaseReferral: Address }] = [
            address as `0x${string}`,
            tokenAmountBigInt,
            costWithSlippage,
            {
              builder: zeroAddress,
              purchaseReferral: zeroAddress,
            },
          ]

          const useRelay = chainId !== toChainId

          if (useRelay) {
            executeBuyTokenRelay({
              chainId,
              tokenEmitter,
              args,
              costWithSlippage,
              toastId,
              onSuccess,
              successMessage,
            })
          } else {
            writeContract({
              account: address,
              abi: tokenEmitterImplAbi,
              functionName: "buyToken",
              address: getEthAddress(tokenEmitter),
              chainId,
              args,
              value: costWithSlippage,
            })
          }
        } catch (e: any) {
          toast.error(e.message, { id: toastId })
        }
      }}
    >
      {insufficientBalance ? "Insufficient ETH balance" : "Buy"}
    </Button>
  )
}
