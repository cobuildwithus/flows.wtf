"use client"

import { BuyTokenButton } from "@/app/token/buy-token-button"
import { useEthBalances } from "@/app/token/hooks/use-eth-balances"
import { useBuyTokenQuoteWithRewards } from "@/app/token/hooks/useBuyTokenQuote"
import { getEthAddress } from "@/lib/utils"

interface Props {
  flow: Pick<FlowWithTcr, "tokenEmitter" | "erc20" | "chainId">
  amount: bigint
  onSuccess: (hash: string) => void
}

export function BuyApplicationFee(props: Props) {
  const { flow, amount, onSuccess } = props

  const { preferredFor } = useEthBalances()

  const { totalCost, isLoading } = useBuyTokenQuoteWithRewards(
    getEthAddress(flow.tokenEmitter),
    amount,
    flow.chainId,
  )

  return (
    <BuyTokenButton
      chainId={preferredFor(BigInt(totalCost)).chainId}
      toChainId={flow.chainId}
      tokenEmitter={getEthAddress(flow.tokenEmitter)}
      costWithRewardsFee={totalCost}
      tokenAmountBigInt={amount}
      isReady={!isLoading}
      onSuccess={onSuccess}
      successMessage="Paid application fee!"
    >
      Pay Deposit
    </BuyTokenButton>
  )
}
