"use client"

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { MonthlySales } from "@/lib/shopify/summary"
import { Bar, CartesianGrid, ComposedChart, Line, XAxis, YAxis } from "recharts"

interface Props {
  data: MonthlySales[]
}

const chartConfig = {
  sales: { label: "Sales ($)", color: "hsl(var(--chart-3))" },
  orders: { label: "Orders", color: "hsl(var(--chart-2))" },
} as const

export function SalesChart({ data }: Props) {
  return (
    <ChartContainer config={chartConfig} className="mt-4 h-[320px] w-full">
      <ComposedChart data={data} accessibilityLayer>
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
  )
}
