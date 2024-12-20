"use client"

import { Address } from "viem"
import { base } from "viem/chains"
import { useReadContracts } from "wagmi"
import { flowTcrImplAbi } from "../abis"

export function useTcrData(contract: Address, chainId = base.id) {
  const tcr = { abi: flowTcrImplAbi, address: contract, chainId }

  const { data } = useReadContracts({
    contracts: [
      { ...tcr, functionName: "getTotalCosts" },
      { ...tcr, functionName: "challengePeriodDuration" },
    ],
  })

  const [totalCosts, challengePeriod] = data || []

  return {
    addItemCost: totalCosts?.result?.[0] || BigInt(0),
    removeItemCost: totalCosts?.result?.[1] || BigInt(0),
    challengeSubmissionCost: totalCosts?.result?.[2] || BigInt(0),
    challengeRemovalCost: totalCosts?.result?.[3] || BigInt(0),
    arbitrationCost: totalCosts?.result?.[4] || BigInt(0),
    challengePeriod: Number(challengePeriod?.result),
    challengePeriodFormatted: challengePeriod?.result
      ? challengePeriod.result >= 86400
        ? `${Math.round(Number(challengePeriod.result) / (60 * 60 * 24))} day(s)`
        : `${(Number(challengePeriod.result) / 3600).toFixed(2)} hour(s)`
      : "0 hours",
  }
}
