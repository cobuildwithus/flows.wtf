"use client"

import { BuyTokenButton } from "@/app/token/buy-token-button"
import { useEthBalances } from "@/app/token/hooks/use-eth-balances"
import { useBuyTokenQuoteWithRewards } from "@/app/token/hooks/useBuyTokenQuote"
import { EthInUsd } from "@/components/global/eth-in-usd"
import { getEthAddress } from "@/lib/utils"
import { Grant } from "@prisma/flows"
import { base } from "viem/chains"

interface Props {
  flow: Pick<Grant, "tokenEmitter" | "erc20">
  amount: bigint
  onSuccess: (hash: string) => void
}

const chainId = base.id

export function BuyApplicationFee(props: Props) {
  const { flow, amount, onSuccess } = props

  const { preferredFor } = useEthBalances()

  const { totalCost, isLoading } = useBuyTokenQuoteWithRewards(
    getEthAddress(flow.tokenEmitter),
    amount,
    chainId,
  )

  return (
    <BuyTokenButton
      chainId={preferredFor(totalCost).chainId}
      tokenEmitter={getEthAddress(flow.tokenEmitter)}
      costWithRewardsFee={totalCost}
      tokenAmountBigInt={amount}
      isReady={!isLoading}
      onSuccess={onSuccess}
      successMessage="Paid application fee!"
    >
      Pay Fee <EthInUsd amount={totalCost} />
    </BuyTokenButton>
  )
}
