import { useRevnetBalance } from "@/lib/revnet/hooks/use-revnet-balance"
import { useMemo } from "react"
import { useETHPrice } from "@/app/token/hooks/useETHPrice"
import { FLOWS_REVNET_PROJECT_ID, FLOWS_TOKEN } from "@/lib/config"
import { useERC20Supply } from "@/lib/erc20/use-erc20-supply"

export function useFlowsTreasuryBalance(projectId: bigint, chainId: number) {
  const { ethPrice } = useETHPrice()

  const {
    data: startupData,
    isLoading: isStartupLoading,
    error: startupError,
  } = useRevnetBalance(projectId, chainId)

  const {
    data: flowsData,
    isLoading: isFlowsLoading,
    error: flowsError,
  } = useRevnetBalance(FLOWS_REVNET_PROJECT_ID, chainId)

  const { totalSupply: flowsSupply, isLoading: isSupplyLoading } = useERC20Supply(
    FLOWS_TOKEN,
    chainId,
  )

  const treasuryBalanceUSD = useMemo(() => {
    if (!startupData?.balance || !flowsData?.balance || !flowsSupply || !ethPrice) {
      return 0
    }

    // Calculate FLOWS token price: (flows treasury balance in ETH * ETH price) / total supply
    const flowsBalanceETH = Number(flowsData.balance)
    const flowsPrice = (flowsBalanceETH * ethPrice) / flowsSupply

    // Calculate startup treasury value: balance in FLOWS * FLOWS price
    const startupBalanceFlows = Number(startupData.balance) / 1e18
    return startupBalanceFlows * flowsPrice
  }, [startupData?.balance, flowsData?.balance, flowsSupply, ethPrice])

  return {
    treasuryBalanceUSD,
    isLoading: isStartupLoading || isFlowsLoading || isSupplyLoading,
    error: startupError || flowsError,
  }
}
