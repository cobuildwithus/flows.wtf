"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

const data = [
  { month: "Jan", sales: 120, orders: 24, avgOrderValue: 120 / 24 },
  { month: "Feb", sales: 140, orders: 28, avgOrderValue: 140 / 28 },
  { month: "Mar", sales: 180, orders: 35, avgOrderValue: 180 / 35 },
  { month: "Apr", sales: 160, orders: 31, avgOrderValue: 160 / 31 },
  { month: "May", sales: 210, orders: 42, avgOrderValue: 210 / 42 },
  { month: "Jun", sales: 250, orders: 48, avgOrderValue: 250 / 48 },
  { month: "Jul", sales: 290, orders: 55, avgOrderValue: 290 / 55 },
  { month: "Aug", sales: 320, orders: 62, avgOrderValue: 320 / 62 },
  { month: "Sep", sales: 350, orders: 68, avgOrderValue: 350 / 68 },
  { month: "Oct", sales: 400, orders: 78, avgOrderValue: 400 / 78 },
  { month: "Nov", sales: 450, orders: 88, avgOrderValue: 450 / 88 },
  { month: "Dec", sales: 500, orders: 98, avgOrderValue: 500 / 98 },
]

export function SalesOverview() {
  const [period, setPeriod] = useState("12m")

  return (
    <Card className="border border-border/40 bg-card/80 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Revenue & Orders</CardTitle>
            <CardDescription className="mt-1 text-xs">Monthly performance metrics</CardDescription>
          </div>
          <Tabs defaultValue="12m" className="w-[200px]" onValueChange={setPeriod}>
            <TabsList className="grid h-auto grid-cols-3">
              <TabsTrigger value="3m" className="text-xs">
                3M
              </TabsTrigger>
              <TabsTrigger value="6m" className="text-xs">
                6M
              </TabsTrigger>
              <TabsTrigger value="12m" className="text-xs">
                12M
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-6 pb-4 pt-0 md:grid-cols-2">
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{
                top: 20,
                right: 5,
                left: 0,
                bottom: 0,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#444" vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10 }}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e1e1e",
                  borderColor: "#333",
                  borderRadius: "4px",
                }}
                itemStyle={{ color: "#fff" }}
                formatter={(value) => [`$${value}`, "Sales"]}
                labelStyle={{ color: "#aaa" }}
              />
              <Legend
                content={() => (
                  <div className="text-center text-xs text-muted-foreground">Sales Volume ($)</div>
                )}
              />
              <Line
                type="monotone"
                dataKey="sales"
                stroke="#2563eb"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6, stroke: "#2563eb", strokeWidth: 2, fill: "#2563eb" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 5, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e1e1e",
                  borderColor: "#333",
                  borderRadius: "4px",
                }}
                itemStyle={{ color: "#fff" }}
                formatter={(value) => [`${value}`, "Orders"]}
                labelStyle={{ color: "#aaa" }}
              />
              <Legend
                content={() => (
                  <div className="text-center text-xs text-muted-foreground">Number of Orders</div>
                )}
              />
              <Bar dataKey="orders" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
