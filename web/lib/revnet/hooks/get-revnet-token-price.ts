"use server"

import { juiceboxDb } from "@/lib/database/juicebox-db"

// Helper to calculate the decay factor based on weight cut and cycles passed
function calculateDecayFactor(weightCutPercent: number, cyclesPassed: number): number {
  const weightCutDecimal = weightCutPercent / 1e9
  return (1 - weightCutDecimal) ** cyclesPassed
}

// Helper to calculate price per token from tokens per ETH
function calculatePricePerToken(tokensPerEth: bigint): bigint {
  if (tokensPerEth === BigInt(0)) {
    return BigInt(0)
  }
  // Price per token = 1 ETH / tokens per ETH = 1e18 / tokensPerEth
  return (BigInt(1e18) * BigInt(1e18)) / tokensPerEth
}

// Helper to adjust price for reserved percentage
function adjustPriceForReserved(price: bigint, reservedPercent: number): bigint {
  // reservedPercent is scaled by 1e4 (e.g., 3800 = 38%)
  // If 38% are reserved, buyers only get 62% of tokens
  // So effective price = price / (1 - reservedPercent/1e4)
  const effectivePercent = BigInt(1e4) - BigInt(reservedPercent)
  if (effectivePercent === BigInt(0)) {
    // If 100% reserved, price is infinite (no tokens available for buyers)
    return BigInt(0)
  }
  return (price * BigInt(1e4)) / effectivePercent
}

export const getRevnetTokenPrice = async (
  projectId: bigint,
  chainId: number,
): Promise<{
  currentPrice: string
}> => {
  try {
    const currentTime = Math.floor(Date.now() / 1000)

    // Find the currently active ruleset
    const activeRuleset = await juiceboxDb.ruleset.findFirst({
      where: {
        chainId,
        projectId: Number(projectId),
        start: {
          lte: BigInt(currentTime),
        },
      },
      orderBy: {
        start: "desc",
      },
      select: {
        weight: true,
        weightCutPercent: true,
        duration: true,
        cycleNumber: true,
        start: true,
        reservedPercent: true,
      },
    })

    if (!activeRuleset) {
      return {
        currentPrice: "0",
      }
    }

    // Calculate how much time has passed since the ruleset started
    const timeElapsed = currentTime - Number(activeRuleset.start)

    let tokensPerEth: bigint

    // If duration is 0, weight doesn't decay
    if (activeRuleset.duration === BigInt(0)) {
      tokensPerEth = BigInt(activeRuleset.weight.toString())
    } else {
      // Calculate how many complete cycles have passed
      const durationSeconds = Number(activeRuleset.duration)
      const cyclesPassed = durationSeconds > 0 ? Math.floor(timeElapsed / durationSeconds) : 0

      // Calculate current weight with decay
      const decayFactor = calculateDecayFactor(activeRuleset.weightCutPercent, cyclesPassed)

      // Convert weight from Decimal to number, handling the 1e18 scaling
      const initialWeightScaled = Number(activeRuleset.weight)
      const currentWeightScaled = Math.floor(initialWeightScaled * decayFactor)
      tokensPerEth = BigInt(currentWeightScaled)
    }

    // Calculate base price per token
    const basePricePerToken = calculatePricePerToken(tokensPerEth)

    // Adjust for reserved percentage
    const adjustedPricePerToken = adjustPriceForReserved(
      basePricePerToken,
      activeRuleset.reservedPercent,
    )

    return {
      currentPrice: adjustedPricePerToken.toString(),
    }
  } catch (error) {
    console.error("Error fetching revnet token price:", error)
    return {
      currentPrice: "0",
    }
  }
}
