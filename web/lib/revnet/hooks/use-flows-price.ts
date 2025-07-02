import { useRevnetBalance } from "@/lib/revnet/hooks/use-revnet-balance"
import { useMemo } from "react"
import { useETHPrice } from "@/app/token/hooks/useETHPrice"
import { FLOWS_REVNET_PROJECT_ID, FLOWS_TOKEN } from "@/lib/config"
import { useERC20Supply } from "@/lib/erc20/use-erc20-supply"
import { base } from "viem/chains"

export function useFlowsPrice() {
  const { ethPrice } = useETHPrice()

  const {
    data: flowsData,
    isLoading: isFlowsLoading,
    error: flowsError,
  } = useRevnetBalance(FLOWS_REVNET_PROJECT_ID, base.id)

  const { totalSupply: flowsSupply, isLoading: isSupplyLoading } = useERC20Supply(
    FLOWS_TOKEN,
    base.id,
  )

  const flowsPrice = useMemo(() => {
    if (!flowsData?.balance || !flowsSupply || !ethPrice) {
      return 0
    }

    // Calculate FLOWS token price: (flows treasury balance in ETH * ETH price) / total supply
    const flowsBalanceETH = Number(flowsData.balance)
    return (flowsBalanceETH * ethPrice) / flowsSupply
  }, [flowsData?.balance, flowsSupply, ethPrice])

  return {
    flowsPrice,
    isLoading: isFlowsLoading || isSupplyLoading,
    error: flowsError,
  }
}
