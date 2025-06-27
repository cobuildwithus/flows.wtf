import { PropsWithChildren } from "react"
import { formatCurrency } from "@/lib/erc20/super-token"

interface Props {
  as?: "span" | "div"
  className?: string
  currency?: "USD" | "ETH" | "ERC20"
  flow?: {
    underlyingTokenSymbol?: string
    underlyingTokenPrefix?: string
  }
}

export const Currency = (props: PropsWithChildren<Props>) => {
  const { children: amount, as: Component = "span", currency = "USD", flow, ...rest } = props
  const { underlyingTokenSymbol: tokenSymbol, underlyingTokenPrefix: tokenPrefix } = flow || {}

  const value = currency === "ETH" || currency === "ERC20" ? Number(amount) / 1e18 : Number(amount)

  // If token overrides are provided, use them regardless of currency type
  if (tokenSymbol || tokenPrefix) {
    const formattedCurrency = formatCurrency(value, tokenSymbol || "Token", tokenPrefix)
    return <Component {...rest}>{formattedCurrency}</Component>
  }

  if (currency === "ETH") {
    return <Component {...rest}>Ξ{formatValue(value)}</Component>
  }

  if (currency === "ERC20") {
    return <Component {...rest}>{formatValue(value)}</Component>
  }

  return (
    <Component {...rest}>
      {value >= 1000
        ? `$${formatValue(value)}`
        : Intl.NumberFormat("en", {
            style: "currency",
            currency: "USD",
            maximumFractionDigits: getCurrencyFractionDigits(value),
          }).format(value)}
    </Component>
  )
}

function getCurrencyFractionDigits(amount: number) {
  if (amount === 0) return 2
  if (amount < 0.001) return 5
  if (amount < 0.01) return 4
  if (amount < 0.1) return 3
  if (amount < 10) return 2
  return 0
}

function formatValue(value: number) {
  if (value >= 1000000) {
    const millions = value / 1000000
    const roundedMillions = Math.round(millions * 10) / 10
    return `${millions.toFixed(roundedMillions % 1 === 0 ? 0 : 1)}M`
  }
  if (value >= 1000) {
    const thousands = value / 1000
    const roundedThousands = Math.round(thousands * 10) / 10
    return `${thousands.toFixed(roundedThousands % 1 === 0 ? 0 : 1)}k`
  }
  return value.toFixed(getCurrencyFractionDigits(value))
}
