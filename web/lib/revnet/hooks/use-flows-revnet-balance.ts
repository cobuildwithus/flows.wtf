import { useRevnetBalance } from "@/lib/revnet/hooks/use-revnet-balance"
import { useMemo } from "react"
import { useFlowsPrice } from "@/lib/revnet/hooks/use-flows-price"
import { base } from "@/addresses"
import { useETHPrice } from "@/app/token/hooks/useETHPrice"

export function useFlowsTreasuryBalance(
  projectId: bigint,
  chainId: number,
  accountingToken: string,
) {
  const { ethPrice } = useETHPrice()
  const {
    data: startupData,
    isLoading: isStartupLoading,
    error: startupError,
  } = useRevnetBalance(projectId, chainId)

  const { flowsPrice, isLoading: isFlowsPriceLoading, error: flowsPriceError } = useFlowsPrice()

  const treasuryBalanceUSD = useMemo(() => {
    if (!startupData?.balance || !flowsPrice) {
      return 0
    }

    const isBackedByFlows = accountingToken === base.FlowsToken

    console.log(isBackedByFlows, startupData.balance)

    if (isBackedByFlows) {
      return (Number(startupData.balance) / 1e18) * flowsPrice
    }

    return (Number(startupData.balance) / 1e18) * (ethPrice || 1)
  }, [startupData?.balance, flowsPrice])

  return {
    treasuryBalanceUSD,
    isLoading: isStartupLoading || isFlowsPriceLoading,
    error: startupError || flowsPriceError,
  }
}
