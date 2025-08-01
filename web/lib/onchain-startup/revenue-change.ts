"use server"

import { getConversionRates } from "@/app/token/eth-price"
import { getFlowsPrice } from "@/lib/revnet/get-flows-price"
import { Order } from "../shopify/orders"
import { type TokenPayment, paymentToUsd } from "./payment-utils"

function calculatePercentageChange(previousValue: number, currentValue: number): number {
  return previousValue > 0 ? ((currentValue - previousValue) / previousValue) * 100 : 0
}

function filterOrdersByDateRange(orders: Order[], startDate: Date, endDate: Date): Order[] {
  return orders.filter((order) => {
    const orderDate = new Date(order.date)
    return orderDate >= startDate && orderDate < endDate
  })
}

function filterTokenPaymentsByDateRange(
  tokenPayments: TokenPayment[],
  startDate: Date,
  endDate: Date,
): TokenPayment[] {
  return tokenPayments.filter((payment) => {
    const paymentDate = new Date(payment.timestamp * 1000)
    return paymentDate >= startDate && paymentDate < endDate
  })
}

function calculateOrderRevenue(orders: Order[]): number {
  return orders.reduce((sum, order) => sum + Number(order.amount), 0)
}

function calculateTokenRevenue(
  tokenPayments: TokenPayment[],
  ethPrice: number,
  flowsPrice: number,
): number {
  return tokenPayments.reduce((sum, payment) => {
    return sum + paymentToUsd(payment, ethPrice, flowsPrice)
  }, 0)
}

function calculateSalesCount(
  orders: Order[],
  tokenPayments: TokenPayment[],
  ethPrice: number,
  flowsPrice: number,
): number {
  const orderCount = orders.length
  const tokenSalesCount = tokenPayments.filter(
    (p) => paymentToUsd(p, ethPrice, flowsPrice) > 1,
  ).length
  return orderCount + tokenSalesCount
}

function calculatePeriodMetrics(
  orders: Order[],
  tokenPayments: TokenPayment[],
  startDate: Date,
  endDate: Date,
  ethPrice: number,
  flowsPrice: number,
) {
  const periodOrders = filterOrdersByDateRange(orders, startDate, endDate)
  const periodTokenPayments = filterTokenPaymentsByDateRange(tokenPayments, startDate, endDate)

  const orderRevenue = calculateOrderRevenue(periodOrders)
  const tokenRevenue = calculateTokenRevenue(periodTokenPayments, ethPrice, flowsPrice)
  const totalRevenue = orderRevenue + tokenRevenue

  const salesCount = calculateSalesCount(periodOrders, periodTokenPayments, ethPrice, flowsPrice)

  return {
    revenue: totalRevenue,
    sales: salesCount,
  }
}

export async function getRevenueChange(
  orders: Order[],
  tokenPayments: TokenPayment[],
): Promise<{
  ordersChange: number
  salesChange: number
  totalSales: number
  totalOrders: number
}> {
  const [rates, flowsPrice] = await Promise.all([getConversionRates(), getFlowsPrice()])

  const ethPrice = rates?.eth || 0

  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)

  // Calculate metrics for both periods
  const last30Days = calculatePeriodMetrics(
    orders,
    tokenPayments,
    thirtyDaysAgo,
    now,
    ethPrice,
    flowsPrice,
  )

  const previous30Days = calculatePeriodMetrics(
    orders,
    tokenPayments,
    sixtyDaysAgo,
    thirtyDaysAgo,
    ethPrice,
    flowsPrice,
  )

  // Calculate total metrics across all time
  const totalOrderRevenue = calculateOrderRevenue(orders)
  const totalTokenRevenue = calculateTokenRevenue(tokenPayments, ethPrice, flowsPrice)
  const totalSales = totalOrderRevenue + totalTokenRevenue
  const totalOrders = calculateSalesCount(orders, tokenPayments, ethPrice, flowsPrice)

  // Calculate percentage changes
  const ordersChange = calculatePercentageChange(previous30Days.revenue, last30Days.revenue)
  const salesChange = calculatePercentageChange(previous30Days.sales, last30Days.sales)

  return {
    ordersChange,
    salesChange,
    totalSales,
    totalOrders,
  }
}
