"use client"

import NumberFlow from "@number-flow/react"
import { useEffect, useState } from "react"

interface Props {
  value: number | string
  monthlyRate: number | string
  grant?: {
    underlyingTokenSymbol?: string
    underlyingTokenPrefix?: string
  }
}

export function AnimatedSalary({ value, monthlyRate, grant }: Props) {
  const [currentValue, setCurrentValue] = useState(Number(value))
  const { underlyingTokenSymbol: tokenSymbol, underlyingTokenPrefix: tokenPrefix } = grant || {}

  useEffect(() => {
    setCurrentValue(Number(value))
  }, [value])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentValue((prev) => prev + Number(monthlyRate) / 60 / 60 / 24 / 30)
    }, 1000)
    return () => clearInterval(interval)
  }, [monthlyRate])

  const fractionDigits = getCurrencyFractionDigits(Number(monthlyRate))

  // If token overrides are provided, use custom formatting without currency style
  if (grant && tokenPrefix !== "$") {
    return (
      <span className="flex items-center gap-1">
        {tokenPrefix && <span>{tokenPrefix}</span>}
        <NumberFlow
          value={currentValue}
          format={{
            minimumFractionDigits: fractionDigits,
            maximumFractionDigits: fractionDigits,
          }}
          locales="en-US"
          trend={1}
        />
      </span>
    )
  }

  return (
    <NumberFlow
      value={currentValue}
      format={{
        currency: "USD",
        style: "currency",
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits,
      }}
      locales="en-US"
      trend={1}
    />
  )
}

export function getCurrencyFractionDigits(rate: number) {
  if (rate === 0) return 2
  if (rate < 1) return 7
  if (rate < 10) return 6
  if (rate < 100) return 5
  if (rate < 1000) return 4
  return 3
}
