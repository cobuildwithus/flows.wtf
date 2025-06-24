import { useBuyTokenQuoteWithRewards } from "@/app/token/hooks/useBuyTokenQuote"
import { getEthAddress } from "@/lib/utils"
import { EthInUsd } from "./eth-in-usd"

interface Props {
  tokenEmitter: string
  amount: bigint
  chainId: number
}

export function TcrInUsd(props: Props) {
  const { tokenEmitter, amount, chainId } = props

  const { totalCost } = useBuyTokenQuoteWithRewards(getEthAddress(tokenEmitter), amount, chainId)

  return <EthInUsd amount={BigInt(totalCost)} />
}
