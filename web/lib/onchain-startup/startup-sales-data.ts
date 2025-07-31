"use server"

import { getStartup } from "@/lib/onchain-startup/startup"
import { getAllOrders } from "@/lib/shopify/orders"
import { getProducts } from "@/lib/shopify/products"
import { getSalesSummary } from "@/lib/shopify/summary"
import { getTokenPayments } from "@/lib/onchain-startup/token-payments"
import { getRevenueMetrics } from "@/lib/onchain-startup/revenue-metrics"
import { combineMonthlySalesWithTokenPayments } from "@/lib/onchain-startup/revenue-data"
import type { MonthlySales } from "@/lib/shopify/summary"
import type { Order } from "@/lib/shopify/orders"
import type { Product } from "@/lib/shopify/products"
import type { Revenue } from "@/lib/onchain-startup/types"

export type SerializedMonthlySales = Omit<MonthlySales, "date"> & { date: string }

export interface StartupSalesData {
  revenue: Revenue
  monthlySales: SerializedMonthlySales[]
  orders: Order[]
  products: Product[]
}

/**
 * Fetches all data required for the revenue dialog that pops up from the home page.
 * The query mirrors the logic used on the individual startup page but bundles it
 * together so it can be requested from the client with a single call.
 */
export async function getStartupSalesData(startupId: string): Promise<StartupSalesData> {
  const startup = await getStartup(startupId)

  // Shopify & on-chain configuration
  const shopifyConfig = startup.shopify
  const projectIdBase = startup.revnetProjectId

  // Parallel data fetching
  const [orders, tokenPayments] = await Promise.all([
    shopifyConfig ? getAllOrders(shopifyConfig) : Promise.resolve([]),
    projectIdBase ? getTokenPayments(projectIdBase) : Promise.resolve([]),
  ])

  const [products, salesSummary] = await Promise.all([
    shopifyConfig ? getProducts(shopifyConfig, orders) : Promise.resolve([]),
    getSalesSummary(orders),
  ])

  // Combine monthly sales with token payments so the chart shows on-chain revenue
  const combinedMonthlySales: SerializedMonthlySales[] = (
    await combineMonthlySalesWithTokenPayments(salesSummary.monthlySales, tokenPayments)
  ).map((m) => ({ ...m, date: (m.date as Date).toISOString() }))

  // Overall revenue metrics (totals & MoM change)
  const revenueMetrics = await getRevenueMetrics(salesSummary.monthlySales, tokenPayments)

  return {
    revenue: revenueMetrics,
    monthlySales: combinedMonthlySales,
    orders,
    products,
  }
}
