import { useUserTcrTokens } from "@/components/global/curator-popover/hooks/use-user-tcr-tokens"
import { Button } from "@/components/ui/button"
import { tokenEmitterImplAbi } from "@/lib/abis"
import { getEthAddress } from "@/lib/utils"
import { useContractTransaction } from "@/lib/wagmi/use-contract-transaction"
import { useWaitForTransactions } from "@/lib/wagmi/use-wait-for-transactions"
import type { ComponentProps, PropsWithChildren } from "react"
import { toast } from "sonner"
import { type Address, zeroAddress } from "viem"
import { useAccount, useBalance } from "wagmi"
import { useBuyTokenRelay } from "./hooks/use-buy-token-relay"

interface Props extends ComponentProps<typeof Button> {
  onSuccess: (hash: string) => void
  tokenEmitter: Address
  costWithRewardsFee: number
  tokenAmountBigInt: bigint
  isReady: boolean
  chainId: number
  toChainId: number
  successMessage?: string
}

export const BuyTokenButton = ({
  onSuccess,
  tokenEmitter,
  costWithRewardsFee,
  tokenAmountBigInt,
  isReady,
  chainId,
  toChainId,
  children = "Buy",
  successMessage = "Tokens bought successfully!",
  ...buttonProps
}: PropsWithChildren<Props>) => {
  const { address } = useAccount()
  const { data: balance } = useBalance({ address, chainId })
  const { mutate: mutateUserTcrTokens } = useUserTcrTokens(address)

  const { executeBuyTokenRelay, txHashes } = useBuyTokenRelay()

  const { prepareWallet, writeContract, isLoading, toastId } = useContractTransaction({
    chainId,
    success: successMessage,
    onSuccess: async (hash) => {
      setTimeout(() => mutateUserTcrTokens(), 1000)
      onSuccess(hash)
    },
  })

  useWaitForTransactions(txHashes, toastId)

  const insufficientBalance =
    balance && balance.value < BigInt(Math.trunc(Number(costWithRewardsFee) * 1.05))

  return (
    <Button
      {...buttonProps}
      disabled={isLoading || !isReady || !balance || insufficientBalance}
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

          const useRelay = toChainId !== chainId

          if (useRelay) {
            executeBuyTokenRelay({
              chainId,
              toChainId,
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
      {insufficientBalance ? "Insufficient ETH balance" : children}
    </Button>
  )
}
