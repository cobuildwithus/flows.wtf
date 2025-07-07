"use server"

import { getConversionRates } from "@/app/token/eth-price"
import { getFlowsPrice } from "@/lib/revnet/get-flows-price"
import type { MonthlySales } from "@/lib/shopify/summary"

export async function combineMonthlySalesWithTokenPayments(
  monthlySales: MonthlySales[],
  tokenPayments: {
    timestamp: number
    ethAmount: string | null
    newlyIssuedTokenCount: string
  }[],
): Promise<MonthlySales[]> {
  const [rates, flowsPrice] = await Promise.all([getConversionRates(), getFlowsPrice()])

  const ethPrice = rates?.eth || 0

  return monthlySales.map((month) => {
    const monthDate = new Date(month.date)
    const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)
    const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0)

    // Filter token payments for this month
    const monthTokenPayments = tokenPayments.filter((payment) => {
      const paymentDate = new Date(payment.timestamp * 1000)
      return paymentDate >= monthStart && paymentDate <= monthEnd
    })

    // Convert to USD using appropriate price
    const revnetSalesUSD = monthTokenPayments.reduce((sum, payment) => {
      if (payment.ethAmount && ethPrice) {
        const ethAmount = Number(payment.ethAmount) / 1e18
        return sum + ethAmount * ethPrice
      } else if (!payment.ethAmount && flowsPrice) {
        const flowsTokens = Number(payment.newlyIssuedTokenCount) / 1e18
        return sum + flowsTokens * flowsPrice
      }
      return sum
    }, 0)

    // Count payments > $1 worth as orders
    const revnetOrders = monthTokenPayments.filter((payment) => {
      if (payment.ethAmount && ethPrice) {
        const ethAmount = Number(payment.ethAmount) / 1e18
        return ethAmount * ethPrice > 1
      } else if (!payment.ethAmount && flowsPrice) {
        const flowsTokens = Number(payment.newlyIssuedTokenCount) / 1e18
        return flowsTokens * flowsPrice > 1
      }
      return false
    }).length

    return {
      ...month,
      sales: month.sales + revnetSalesUSD,
      orders: month.orders + revnetOrders,
    }
  })
}
