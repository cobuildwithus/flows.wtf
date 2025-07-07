"use server"

import type { MonthlySales } from "@/lib/shopify/summary"
import { combineMonthlySalesWithTokenPayments } from "./sales-data"

export interface SalesMetrics {
  totalSales: number
  totalOrders: number
  salesChange: number
  ordersChange: number
}

export async function getCombinedSalesMetrics(
  monthlySales: MonthlySales[],
  tokenPayments: {
    timestamp: number
    ethAmount: string | null
    newlyIssuedTokenCount: string
  }[],
): Promise<SalesMetrics> {
  // Get combined data with token payments included
  const combinedData = await combineMonthlySalesWithTokenPayments(monthlySales, tokenPayments)
  console.log({ combinedData })

  // Calculate total sales and orders from all combined data
  const totalSales = combinedData.reduce((sum, month) => sum + month.sales, 0)
  const totalOrders = combinedData.reduce((sum, month) => sum + month.orders, 0)

  const totalMonths = combinedData.length

  // Get this month and last month data for change calculation
  const thisMonth = combinedData[totalMonths - 1]
  const lastMonth = combinedData[totalMonths - 2]

  // Calculate percentage changes
  const salesChange =
    thisMonth && lastMonth && lastMonth.sales > 0
      ? ((thisMonth.sales - lastMonth.sales) / lastMonth.sales) * 100
      : 0
  const ordersChange =
    thisMonth && lastMonth && lastMonth.orders > 0
      ? ((thisMonth.orders - lastMonth.orders) / lastMonth.orders) * 100
      : 0

  return {
    totalSales,
    totalOrders,
    salesChange,
    ordersChange,
  }
}
