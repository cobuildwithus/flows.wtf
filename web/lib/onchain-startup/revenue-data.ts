"use server"

import { getConversionRates } from "@/app/token/eth-price"
import { getFlowsPrice } from "@/lib/revnet/get-flows-price"
import type { MonthlySales } from "@/lib/shopify/summary"

type TokenPayment = {
  timestamp: number
  ethAmount: string | null
  newlyIssuedTokenCount: string
}

const WEI_IN_ETH = 1e18

function getMonthKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}`
}

function paymentToUsd(payment: TokenPayment, ethPrice: number, flowsPrice: number): number {
  if (payment.ethAmount && ethPrice) {
    return (Number(payment.ethAmount) / WEI_IN_ETH) * ethPrice
  }
  if (!payment.ethAmount && flowsPrice) {
    return (Number(payment.newlyIssuedTokenCount) / WEI_IN_ETH) * flowsPrice
  }
  return 0
}

function aggregateTokenPaymentsByMonth(
  payments: TokenPayment[],
  ethPrice: number,
  flowsPrice: number,
): Map<string, { date: Date; sales: number; orders: number }> {
  const map = new Map<string, { date: Date; sales: number; orders: number }>()

  for (const p of payments) {
    const date = new Date(p.timestamp * 1000)
    const key = getMonthKey(date)
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)

    const usd = paymentToUsd(p, ethPrice, flowsPrice)

    if (!map.has(key)) {
      map.set(key, { date: monthStart, sales: 0, orders: 0 })
    }

    const entry = map.get(key)!
    entry.sales += usd
    if (usd > 1) entry.orders += 1
  }

  return map
}

export async function combineMonthlySalesWithTokenPayments(
  monthlySales: MonthlySales[],
  tokenPayments: TokenPayment[],
): Promise<MonthlySales[]> {
  const [rates, flowsPrice] = await Promise.all([getConversionRates(), getFlowsPrice()])

  const ethPrice = rates?.eth || 0
  // If there are no token payments we can return original sales data after padding
  if (tokenPayments.length === 0) {
    return padPreviousMonthIfNeeded(
      [...monthlySales].sort((a, b) => a.date.getTime() - b.date.getTime()),
    )
  }

  const paymentsByMonth = aggregateTokenPaymentsByMonth(tokenPayments, ethPrice, flowsPrice)

  let merged: MonthlySales[]

  if (monthlySales.length === 0) {
    // Build from token payments only
    merged = [...paymentsByMonth.values()].map(({ date, sales, orders }) => ({
      month: date.toLocaleDateString("en-US", { month: "short" }),
      sales,
      orders,
      date,
    }))
  } else {
    merged = monthlySales.map((month) => {
      const tokenData = paymentsByMonth.get(getMonthKey(month.date))
      if (!tokenData) return month

      return {
        ...month,
        sales: month.sales + tokenData.sales,
        orders: month.orders + tokenData.orders,
      }
    })
  }

  return padPreviousMonthIfNeeded(merged.sort((a, b) => a.date.getTime() - b.date.getTime()))
}

// Ensure at least two months of data by inserting the previous month with zero revenue
function padPreviousMonthIfNeeded(data: MonthlySales[]): MonthlySales[] {
  if (data.length !== 1) return data

  const only = data[0]
  const prevDate = new Date(only.date.getFullYear(), only.date.getMonth() - 1, 1)

  return [
    {
      month: prevDate.toLocaleDateString("en-US", { month: "short" }),
      sales: 0,
      orders: 0,
      date: prevDate,
    },
    only,
  ].sort((a, b) => a.date.getTime() - b.date.getTime())
}
