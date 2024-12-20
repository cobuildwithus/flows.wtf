import { useBuyTokenQuoteWithRewards } from "@/app/token/hooks/useBuyTokenQuote"
import { getEthAddress } from "@/lib/utils"
import { EthInUsd } from "./eth-in-usd"

interface Props {
  tokenEmitter: string
  amount: bigint
}

export function TcrInUsd(props: Props) {
  const { tokenEmitter, amount } = props

  const { totalCost } = useBuyTokenQuoteWithRewards(getEthAddress(tokenEmitter), amount)

  return <EthInUsd amount={totalCost} />
}
