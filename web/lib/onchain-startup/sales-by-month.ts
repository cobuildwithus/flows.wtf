import { getConversionRates } from "@/app/token/eth-price"
import { getFlowsPrice } from "@/lib/revnet/get-flows-price"
import { type MonthlySales } from "../shopify/summary"
import { Order } from "../shopify/orders"
import { type TokenPayment, paymentToUsd } from "./payment-utils"

// Aggregate Shopify orders by month (keyed by "YYYY-M")
function aggregateOrdersByMonth(
  orders: Order[],
): Map<string, { date: Date; sales: number; orders: number }> {
  const map = new Map<string, { date: Date; sales: number; orders: number }>()

  for (const o of orders) {
    const date = new Date(o.date)
    const key = getMonthKey(date)
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)

    if (!map.has(key)) {
      map.set(key, { date: monthStart, sales: 0, orders: 0 })
    }

    const entry = map.get(key)!
    entry.sales += Number(o.amount)
    entry.orders += 1
  }

  return map
}

function getMonthKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}`
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

export async function getSalesByMonth(
  orders: Order[],
  tokenPayments: TokenPayment[],
): Promise<MonthlySales[]> {
  // 1. Group Shopify orders by month
  const ordersByMonth = aggregateOrdersByMonth(orders)
  let monthlySales = mapToMonthlySalesArray(ordersByMonth)

  // 2. If there are no token payments we can return the Shopify data straight away
  if (tokenPayments.length === 0) {
    return padPreviousMonthIfNeeded(monthlySales)
  }

  // 3. Convert token payments to USD & aggregate by month
  const [rates, flowsPrice] = await Promise.all([getConversionRates(), getFlowsPrice()])
  const ethPrice = rates?.eth || 0
  const paymentsByMonth = aggregateTokenPaymentsByMonth(tokenPayments, ethPrice, flowsPrice)

  // 4. Merge the two datasets
  const combinedMap = new Map<string, { date: Date; sales: number; orders: number }>()
  // Seed with order data
  ordersByMonth.forEach((value, key) => combinedMap.set(key, { ...value }))
  // Add / merge token data
  paymentsByMonth.forEach((value, key) => {
    if (combinedMap.has(key)) {
      const existing = combinedMap.get(key)!
      existing.sales += value.sales
      existing.orders += value.orders
    } else {
      combinedMap.set(key, { ...value })
    }
  })

  monthlySales = mapToMonthlySalesArray(combinedMap)
  return padPreviousMonthIfNeeded(monthlySales)
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

/**
 * Utility: Converts a map keyed by `YYYY-M` into an ordered `MonthlySales[]`.
 */
export function mapToMonthlySalesArray(
  map: Map<string, { date: Date; sales: number; orders: number }>,
): MonthlySales[] {
  if (map.size === 0) return []

  // Determine the range
  const dates = [...map.values()].map((v) => v.date)
  const minDate = new Date(Math.min(...dates.map((d) => d.getTime())))
  let maxDate = new Date(Math.max(...dates.map((d) => d.getTime())))

  // Ensure we include the current month even if there are no sales yet
  const today = new Date()
  const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1)
  if (currentMonthStart.getTime() > maxDate.getTime()) {
    maxDate = currentMonthStart
  }

  // Build a continuous list of months between min and max (inclusive)
  const result: MonthlySales[] = []
  for (
    let current = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
    current.getTime() <= maxDate.getTime();
    current = new Date(current.getFullYear(), current.getMonth() + 1, 1)
  ) {
    const key = getMonthKey(current)
    const entry = map.get(key)

    result.push({
      month: current.toLocaleDateString("en-US", { month: "short" }),
      sales: entry?.sales ?? 0,
      orders: entry?.orders ?? 0,
      date: current,
    })
  }

  return result
}
