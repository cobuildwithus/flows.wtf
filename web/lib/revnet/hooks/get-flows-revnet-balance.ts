"use server"

import { getRevnetBalance } from "./get-revnet-balance"
import { getERC20Supply } from "@/lib/tcr/get-erc20-supply"
import { getConversionRates } from "@/app/token/eth-price"
import { FLOWS_REVNET_PROJECT_ID, FLOWS_TOKEN } from "@/lib/config"

export async function getFlowsTreasuryBalance(
  projectId: bigint,
  chainId: number,
): Promise<{
  treasuryBalanceUSD: number
  startupBalance: string
  flowsBalance: string
  flowsSupply: number
  flowsPrice: number
  participantsCount: number
}> {
  try {
    // Get data in parallel
    const [startupData, flowsData, flowsSupply, rates] = await Promise.all([
      getRevnetBalance(projectId, chainId),
      getRevnetBalance(FLOWS_REVNET_PROJECT_ID, chainId),
      getERC20Supply(FLOWS_TOKEN, chainId),
      getConversionRates(),
    ])

    const ethPrice = rates?.eth || 0

    if (!startupData?.balance || !flowsData?.balance || !flowsSupply || !ethPrice) {
      return {
        treasuryBalanceUSD: 0,
        startupBalance: "0",
        flowsBalance: "0",
        flowsSupply: 0,
        flowsPrice: 0,
        participantsCount: startupData?.participantsCount || 0,
      }
    }

    // Calculate FLOWS token price: (flows treasury balance in ETH * ETH price) / total supply
    const flowsBalanceETH = Number(flowsData.balance) // Convert from wei to ETH
    const flowsPrice = (flowsBalanceETH * ethPrice) / flowsSupply

    // Calculate startup treasury value: balance in FLOWS * FLOWS price
    const startupBalanceFlows = Number(startupData.balance) / 1e18
    const treasuryBalanceUSD = startupBalanceFlows * flowsPrice

    return {
      treasuryBalanceUSD,
      startupBalance: startupData.balance,
      flowsBalance: flowsData.balance,
      flowsSupply,
      flowsPrice,
      participantsCount: startupData.participantsCount,
    }
  } catch (error) {
    console.error("Error fetching flows treasury balance:", error)
    return {
      treasuryBalanceUSD: 0,
      startupBalance: "0",
      flowsBalance: "0",
      flowsSupply: 0,
      flowsPrice: 0,
      participantsCount: 0,
    }
  }
}
