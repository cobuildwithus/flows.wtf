"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { MonthlySales } from "@/lib/shopify/summary"
import { Bar, CartesianGrid, ComposedChart, Line, XAxis, YAxis } from "recharts"

import { BringRevenueOnchain } from "./bring-revenue-onchain"
import { useETHPrice } from "@/app/token/hooks/useETHPrice"
import { useFlowsPrice } from "@/lib/revnet/hooks/use-flows-price"

interface Props {
  monthlySales: MonthlySales[]
  startupTitle: string
  projectId: bigint
  chainId: number
  tokenPayments: {
    timestamp: number
    ethAmount: string | null
    newlyIssuedTokenCount: string
  }[]
}

const chartConfig = {
  sales: { label: "Sales ($)", color: "hsl(var(--chart-3))" },
  orders: { label: "Orders", color: "hsl(var(--chart-2))" },
} as const

export function SalesOverview(props: Props) {
  const { monthlySales, startupTitle, projectId, chainId, tokenPayments } = props
  const { ethPrice } = useETHPrice()
  const { flowsPrice } = useFlowsPrice()

  const combinedData = useMemo(() => {
    if (ethPrice == null && flowsPrice == null) return monthlySales
    return combineMonthlySalesWithTokenPayments(monthlySales, tokenPayments, ethPrice, flowsPrice)
  }, [monthlySales, tokenPayments, ethPrice, flowsPrice])

  return (
    <Card className="border border-border/40 bg-card/80 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex w-full flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Revenue</CardTitle>
            <CardDescription className="mt-1 text-xs">Grows the network</CardDescription>
          </div>
          <BringRevenueOnchain
            startupTitle={startupTitle}
            projectId={projectId}
            chainId={chainId}
          />
        </div>
      </CardHeader>
      <CardContent className="pb-4 pt-2">
        <ChartContainer config={chartConfig} className="mt-4 h-[320px] w-full">
          <ComposedChart
            key={`${ethPrice ?? "noEth"}-${flowsPrice ?? "noFlows"}`}
            data={combinedData}
            accessibilityLayer
          >
            <CartesianGrid vertical={false} />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
            <YAxis
              yAxisId="sales"
              orientation="left"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10 }}
              tickFormatter={(value) => `$${value}`}
              width={40}
            />
            <YAxis
              yAxisId="orders"
              orientation="right"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10 }}
              width={32}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar
              yAxisId="orders"
              dataKey="orders"
              fill="var(--color-orders)"
              fillOpacity={0.3}
              radius={[8, 8, 0, 0]}
            />
            <Line
              yAxisId="sales"
              type="monotone"
              dataKey="sales"
              strokeWidth={2}
              dot={false}
              stroke="var(--color-sales)"
              activeDot={{ r: 6, strokeWidth: 2 }}
            />
          </ComposedChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

function combineMonthlySalesWithTokenPayments(
  monthlySales: MonthlySales[],
  tokenPayments: {
    timestamp: number
    ethAmount: string | null
    newlyIssuedTokenCount: string
  }[],
  ethPrice: number | null,
  flowsPrice: number | null,
) {
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
        const flowsAmount = Number(payment.ethAmount) / 1e18
        return sum + flowsAmount * ethPrice
      } else if (!payment.ethAmount && flowsPrice) {
        const flowsTokens = Number(payment.newlyIssuedTokenCount) / 1e18
        return sum + flowsTokens * flowsPrice
      }
      return sum
    }, 0)

    // Count payments > $1 worth as orders
    const revnetOrders = monthTokenPayments.filter((payment) => {
      if (payment.ethAmount && ethPrice) {
        const flowsAmount = Number(payment.ethAmount) / 1e18
        return flowsAmount * ethPrice > 1
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
