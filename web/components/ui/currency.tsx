import { PropsWithChildren } from "react"

interface Props {
  as?: "span" | "div"
  className?: string
  currency?: "USD" | "ETH" | "ERC20"
}

export const Currency = (props: PropsWithChildren<Props>) => {
  const { children: amount, as: Component = "span", currency = "USD", ...rest } = props

  const value = currency === "ETH" || currency === "ERC20" ? Number(amount) / 1e18 : Number(amount)

  if (currency === "ETH") {
    return <Component {...rest}>Ξ{value.toFixed(getCurrencyFractionDigits(value))}</Component>
  }

  if (currency === "ERC20") {
    return <Component {...rest}>{value.toFixed(getCurrencyFractionDigits(value))}</Component>
  }

  return (
    <Component {...rest}>
      {Intl.NumberFormat("en", {
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
