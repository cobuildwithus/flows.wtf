import { unstable_cache } from "next/cache"
import { Order } from "./orders"

export interface MonthlySales {
  month: string
  sales: number
  orders: number
}

export const getSalesSummary = unstable_cache(
  async (orders: Order[]) => {
    let totalOrders = 0
    let totalSales = 0
    const monthlyMap = new Map<string, { sales: number; orders: number; date: Date }>()

    orders.forEach((order) => {
      totalOrders += 1
      const price = Number(order.amount)
      totalSales += price
      const createdAt = new Date(order.date)
      const key = getMonthKey(createdAt)
      if (!monthlyMap.has(key)) {
        monthlyMap.set(key, { sales: 0, orders: 0, date: createdAt })
      }
      const monthData = monthlyMap.get(key)!
      monthData.sales += price
      monthData.orders += 1
    })

    const monthlySales: MonthlySales[] = Array.from(monthlyMap.values())
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .map(({ sales, orders, date }) => ({
        month: getMonthLabel(date),
        sales,
        orders,
      }))

    return {
      totalSales,
      totalOrders,
      monthlySales,
    }
  },
  ["shopify", "sales-summary"],
  { revalidate: 60 * 30 },
)

function getMonthKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth() + 1}`
}

function getMonthLabel(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short" })
}
