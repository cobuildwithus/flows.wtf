import { unstable_cache } from "next/cache"
import { Order } from "./orders"

export interface MonthlySales {
  month: string
  sales: number
  orders: number
  date: Date
}

export const getSalesSummary = async (orders: Order[]) => {
  let totalOrders = 0
  let totalSales = 0
  const monthlyMap = new Map<string, { sales: number; orders: number; date: Date }>()

  if (orders.length === 0) return { totalSales: 0, totalOrders: 0, monthlySales: [] }

  let minDate: Date | null = null
  let maxDate: Date | null = null

  orders.forEach((order) => {
    totalOrders += 1
    const price = Number(order.amount)
    totalSales += price
    const createdAt = new Date(order.date)
    if (!minDate || createdAt < minDate) minDate = createdAt
    if (!maxDate || createdAt > maxDate) maxDate = createdAt
    const key = getMonthKey(createdAt)
    if (!monthlyMap.has(key)) {
      monthlyMap.set(key, { sales: 0, orders: 0, date: createdAt })
    }
    const monthData = monthlyMap.get(key)!
    monthData.sales += price
    monthData.orders += 1
  })

  const now = new Date()
  const months: { key: string; date: Date }[] = []
  let current = new Date(minDate!.getFullYear(), minDate!.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth(), 1)
  while (current <= end) {
    months.push({ key: getMonthKey(current), date: new Date(current) })
    current.setMonth(current.getMonth() + 1)
  }

  const monthlySales: MonthlySales[] = months
    .map(({ key, date }) => {
      const data = monthlyMap.get(key)
      return {
        month: getMonthLabel(date),
        sales: data ? data.sales : 0,
        orders: data ? data.orders : 0,
        date: date,
      }
    })
    .sort((a, b) => a.date.getTime() - b.date.getTime())

  return { totalSales, totalOrders, monthlySales }
}

function getMonthKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth() + 1}`
}

function getMonthLabel(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short" })
}
