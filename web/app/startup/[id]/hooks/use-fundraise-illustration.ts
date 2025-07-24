"use client"

import { useState, useMemo } from "react"
import { useRevnetTokenPrice } from "@/lib/revnet/hooks/use-revnet-token-price"

export function useFundraiseIllustration(
  projectId: number,
  chainId: number,
  isBackedByFlows: boolean,
) {
  const [productsVolumeEth, setProductsVolumeEth] = useState(0)
  const [tokenVolume, setTokenVolumeEth] = useState(0)

  const { calculateTokensFromEth } = useRevnetTokenPrice(projectId, chainId, isBackedByFlows)

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
