"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { MonthlySales } from "@/lib/shopify/summary"
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"

interface Props {
  monthlySales: MonthlySales[]
}

const chartConfig = {
  sales: { label: "Sales", color: "hsl(var(--chart-3))" },
  orders: { label: "Orders", color: "hsl(var(--chart-2))" },
} as const

export function SalesOverview(props: Props) {
  const { monthlySales } = props

  return (
    <Card className="border border-border/40 bg-card/80 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Revenue & Orders</CardTitle>
            <CardDescription className="mt-1 text-xs">Monthly performance metrics</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-6 pb-4 pt-0 md:grid-cols-2">
        <ChartContainer config={chartConfig}>
          <LineChart data={monthlySales} accessibilityLayer>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10 }}
              tickFormatter={(value) => `$${value}`}
            />
            <ChartTooltip content={<ChartTooltipContent />} />

            <ChartLegend
              content={() => (
                <div className="text-center text-xs text-muted-foreground">Sales Volume ($)</div>
              )}
            />
            <Line
              type="monotone"
              dataKey="sales"
              strokeWidth={2}
              dot={false}
              stroke="var(--color-sales)"
              activeDot={{ r: 6, strokeWidth: 2 }}
            />
          </LineChart>
        </ChartContainer>
        <ChartContainer config={chartConfig}>
          <BarChart data={monthlySales} accessibilityLayer>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend
              content={() => (
                <div className="text-center text-xs text-muted-foreground">Number of Orders</div>
              )}
            />
            <Bar dataKey="orders" fill="var(--color-orders)" radius={8} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
