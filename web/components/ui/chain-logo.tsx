"use client"

import { TokenLogo } from "@/app/token/token-logo"
import { base, mainnet } from "viem/chains"

interface Props {
  chainId: number
  size?: number
  className?: string
}

const logos = {
  [base.id]: "/base.png",
  [mainnet.id]: "/eth.png",
}

export function ChainLogo(props: Props) {
  const { chainId, size = 30, className } = props

  return (
    <TokenLogo
      src={logos[chainId as keyof typeof logos] || "/eth.png"}
      alt={chainId.toString()}
      size={size}
      className={className}
    />
  )
}
