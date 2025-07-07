import useSWR from "swr"
import { getConversionRates } from "../eth-price"

export function useETHPrice(skip?: boolean) {
  const { data, ...rest } = useSWR(skip ? undefined : "eth_price", getConversionRates)

  return {
    ethPrice: data?.eth || null,
    ...rest,
  }
}

export function formatUSDValue(ethPrice: number, ethAmount: bigint): string {
  const usdValue = (Number(ethAmount) / 1e18) * ethPrice

  if (usdValue >= 1000) {
    if (usdValue >= 1000000) {
      const millions = usdValue / 1000000
      const roundedMillions = Math.round(millions * 10) / 10
      return `$${millions.toFixed(roundedMillions % 1 === 0 ? 0 : 1)}M`
    }
    const thousands = usdValue / 1000
    const roundedThousands = Math.round(thousands * 10) / 10
    return `$${thousands.toFixed(roundedThousands % 1 === 0 ? 0 : 1)}k`
  }

  return Intl.NumberFormat("en", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: getCurrencyFractionDigits(usdValue),
  }).format(usdValue)
}

function getCurrencyFractionDigits(amount: number) {
  if (amount === 0) return 2
  if (amount < 0.001) return 5
  if (amount < 0.01) return 4
  if (amount < 0.1) return 3
  if (amount < 99) return 2
  return 0
}
