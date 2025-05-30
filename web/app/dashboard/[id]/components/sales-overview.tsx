"use client"

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
import { base } from "viem/chains"
import { BringRevenueOnchain } from "./bring-revenue-onchain"

interface Props {
  monthlySales: MonthlySales[]
  startupTitle: string
  projectId: bigint
}

const chartConfig = {
  sales: { label: "Sales ($)", color: "hsl(var(--chart-3))" },
  orders: { label: "Orders", color: "hsl(var(--chart-2))" },
} as const

export function SalesOverview(props: Props) {
  const { monthlySales, startupTitle, projectId } = props

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
            chainId={base.id}
          />
        </div>
      </CardHeader>
      <CardContent className="pb-4 pt-2">
        <ChartContainer config={chartConfig} className="mt-4 h-[320px] w-full">
          <ComposedChart data={monthlySales} accessibilityLayer>
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
