import useSWR from "swr"
import { getConversionRates } from "../ethPrice"

export function useETHPrice(skip?: boolean) {
  const { data, ...rest } = useSWR(skip ? undefined : "eth_price", getConversionRates)

  return {
    ethPrice: data?.eth || null,
    ...rest,
  }
}

export function formatUSDValue(ethPrice: number, ethAmount: bigint): string {
  const usdValue = (Number(ethAmount) / 1e18) * ethPrice

  if (usdValue === 0) {
    return `$${usdValue.toFixed(2)}`
  } else if (usdValue < 0.01) {
    return `$${usdValue.toFixed(4)}`
  } else if (usdValue < 1) {
    return `$${usdValue.toFixed(3)}`
  } else if (usdValue < 10) {
    return `$${usdValue.toFixed(2)}`
  } else if (usdValue < 1e6) {
    return `$${usdValue.toFixed(0)}`
  } else {
    return `$${(usdValue / 1000000).toFixed(2)}M`
  }
}
