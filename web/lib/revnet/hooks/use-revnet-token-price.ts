"use client"

import { useServerFunction } from "@/lib/hooks/use-server-function"
import { getRevnetTokenPrice } from "./get-revnet-token-price"
import { formatEther, parseEther } from "viem"
import { useMemo } from "react"

export function useRevnetTokenPrice(projectId: bigint, chainId: number) {
  const result = useServerFunction(
    getRevnetTokenPrice,
    "revnet-token-price",
    [projectId, chainId],
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: false,
    },
  )

  const helpers = useMemo(() => {
    const currentPrice = result.data?.currentPrice

    // Calculate tokens from ETH amount
    const calculateTokensFromEth = (ethAmount: string): string => {
      if (!currentPrice || !ethAmount || ethAmount === "") return ""

      try {
        const payAmountWei = parseEther(ethAmount)
        const currentPriceWei = BigInt(currentPrice)

        if (currentPriceWei === 0n) return "0"

        const tokens = (payAmountWei * BigInt(1e18)) / currentPriceWei
        const tokensFormatted = formatEther(tokens)

        // Remove trailing zeros and format nicely
        const rounded = Number.parseFloat(tokensFormatted).toFixed(2)
        return Number.parseFloat(rounded).toString()
      } catch (error) {
        return ""
      }
    }

    // Calculate ETH from token amount
    const calculateEthFromTokens = (tokenAmount: string): string => {
      if (!currentPrice || !tokenAmount || tokenAmount === "") return ""

      try {
        const tokenAmountWei = parseEther(tokenAmount)
        const currentPriceWei = BigInt(currentPrice)

        // ETH needed = tokens * pricePerToken
        const ethNeeded = (tokenAmountWei * currentPriceWei) / BigInt(1e18)
        const ethFormatted = formatEther(ethNeeded)

        // Remove trailing zeros and format nicely
        const rounded = Number.parseFloat(ethFormatted).toFixed(6)
        return Number.parseFloat(rounded).toString()
      } catch (error) {
        return ""
      }
    }

    return {
      calculateTokensFromEth,
      calculateEthFromTokens,
    }
  }, [result.data?.currentPrice])

  return {
    ...result,
    ...helpers,
  }
}
