"use client"

import { type Prisma } from "@prisma/flows"
import NumberFlow from "@number-flow/react"
import { useEffect, useState } from "react"

interface Props {
  value: number | string | Prisma.Decimal
  monthlyRate: number | string | Prisma.Decimal
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
      setCurrentValue((prev) => prev + Number(monthlyRate) / 30 / 24 / 60 / 60)
    }, 1000)
    return () => clearInterval(interval)
  }, [monthlyRate])

  const fractionDigits = getCurrencyFractionDigits(Number(monthlyRate))

  // If token overrides are provided, use custom formatting without currency style
  if (grant && tokenPrefix !== "$") {
    return (
      <span>
        {tokenPrefix && <span className="mr-0.5">{tokenPrefix}</span>}
        <NumberFlow
          value={currentValue}
          format={{
            minimumFractionDigits: fractionDigits,
            maximumFractionDigits: fractionDigits,
          }}
          locales="en-US"
          trend={1}
        />
        {tokenSymbol && !tokenPrefix && <span className="ml-2">{tokenSymbol}</span>}
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
  if (rate < 0.01) return 5
  if (rate < 0.1) return 4
  if (rate < 1) return 3
  if (rate < 10) return 2
  return 0
}
