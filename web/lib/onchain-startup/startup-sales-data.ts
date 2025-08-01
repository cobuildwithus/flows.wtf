"use server"

import { getStartup } from "@/lib/onchain-startup/startup"
import { getAllOrders } from "@/lib/shopify/orders"
import { getProducts } from "@/lib/shopify/products"
import { getTokenPayments } from "@/lib/onchain-startup/token-payments"
import { getSalesByMonth } from "@/lib/onchain-startup/sales-by-month"
import type { Order } from "@/lib/shopify/orders"
import type { Product } from "@/lib/shopify/products"
import type { Revenue } from "@/lib/onchain-startup/types"
import type { MonthlySales } from "../shopify/summary"
import { getRevenueChange } from "./revenue-change"

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

  const [products, rawMonthlySales, revenueMetrics] = await Promise.all([
    shopifyConfig ? getProducts(shopifyConfig, orders) : Promise.resolve([]),
    getSalesByMonth(orders, tokenPayments),
    getRevenueChange(orders, tokenPayments),
  ])

  // Serialize the date so the data can be sent to the client safely
  const combinedMonthlySales: SerializedMonthlySales[] = rawMonthlySales.map((m) => ({
    ...m,
    date: m.date.toISOString(),
  }))

  return {
    revenue: revenueMetrics,
    monthlySales: combinedMonthlySales,
    orders,
    products,
  }
}
