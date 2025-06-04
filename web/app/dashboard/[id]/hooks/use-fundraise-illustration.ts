"use client"

import { useState, useMemo } from "react"
import { useRevnetTokenPrice } from "@/lib/revnet/hooks/use-revnet-token-price"
import { base } from "viem/chains"

export function useFundraiseIllustration(projectId: bigint) {
  const [productsVolumeEth, setProductsVolumeEth] = useState(0)
  const [tokenVolume, setTokenVolumeEth] = useState(0)

  const { calculateTokensFromEth } = useRevnetTokenPrice(projectId, base.id)

  const totalRevnetTokens = useMemo(() => {
    if (!projectId) return "0"
    const totalEth = productsVolumeEth + tokenVolume
    return calculateTokensFromEth(totalEth.toString())
  }, [productsVolumeEth, tokenVolume, calculateTokensFromEth, projectId])

  return {
    productsVolumeEth,
    setProductsVolumeEth,
    tokenVolume,
    setTokenVolumeEth,
    totalRevnetTokens,
  }
}
