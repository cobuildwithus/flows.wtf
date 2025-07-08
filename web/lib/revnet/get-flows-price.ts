"use server"

import { unstable_cache } from "next/cache"
import { getConversionRates } from "@/app/token/eth-price"
import { getRevnetBalance } from "@/lib/revnet/hooks/get-revnet-balance"
import { getERC20Supply } from "@/lib/tcr/get-erc20-supply"
import { FLOWS_REVNET_PROJECT_ID, FLOWS_TOKEN } from "@/lib/config"
import { base } from "viem/chains"

async function _getFlowsPrice(): Promise<number> {
  const [rates, flowsData, flowsSupply] = await Promise.all([
    getConversionRates(),
    getRevnetBalance(FLOWS_REVNET_PROJECT_ID, base.id),
    getERC20Supply(FLOWS_TOKEN, base.id),
  ])

  const ethPrice = rates?.eth || 0

  if (!flowsData?.balance || !flowsSupply || !ethPrice) {
    return 0
  }

  // Calculate FLOWS token price: (flows treasury balance in ETH * ETH price) / total supply
  const flowsBalanceETH = Number(flowsData.balance)
  return (flowsBalanceETH * ethPrice) / flowsSupply
}

export const getFlowsPrice = unstable_cache(_getFlowsPrice, ["flows-price"], {
  revalidate: 60, // Cache for 60 seconds
  tags: ["flows-price"],
})
