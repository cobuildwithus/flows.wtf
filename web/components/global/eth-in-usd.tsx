import { formatUSDValue, useETHPrice } from "@/app/token/hooks/useETHPrice"

interface Props {
  amount: bigint
}

export function EthInUsd(props: Props) {
  const { amount } = props
  const { ethPrice } = useETHPrice()

  return formatUSDValue(ethPrice || 0, amount)
}
