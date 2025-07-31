import { getAllOrders } from "../shopify/orders"
import { getSalesSummary } from "../shopify/summary"
import { getRevenueMetrics } from "./revenue-metrics"
import { Startup } from "./startup"
import { getTokenPayments } from "./token-payments"

export async function getTotalRevenue(
  startups: Pick<Startup, "revnetProjectId" | "id" | "shopify">[],
) {
  const results = await Promise.all(
    startups.map(async (startup, index) => {
      const [orders, tokenPayments] = await Promise.all([
        startup.shopify ? getAllOrders(startup.shopify) : Promise.resolve([]),
        startup.revnetProjectId
          ? getTokenPayments(Number(startup.revnetProjectId))
          : Promise.resolve([]),
      ])

      const salesSummary = await getSalesSummary(orders)

      // Get combined sales metrics including token payments
      const combinedMetrics = await getRevenueMetrics(salesSummary.monthlySales, tokenPayments)

      return {
        startupId: startup.id,
        startupIndex: index,
        projectId: Number(startup.revnetProjectId),
        totalSales: combinedMetrics.totalSales,
        salesChange: combinedMetrics.salesChange,
      }
    }),
  )

  const totalRevenue = results.reduce((total, result) => total + result.totalSales, 0)

  const totalSalesChange =
    totalRevenue > 0
      ? results.reduce((sum, result) => sum + result.salesChange * result.totalSales, 0) /
        totalRevenue
      : 0

  // Create a map of startup ID to revenue data for easy lookup
  const revenueByProjectId = new Map(
    results.map((result) => [
      result.startupId,
      {
        totalSales: result.totalSales,
        salesChange: result.salesChange,
      },
    ]),
  )

  return {
    totalRevenue,
    salesChange: totalSalesChange,
    startupRevenues: results,
    revenueByProjectId,
  }
}
