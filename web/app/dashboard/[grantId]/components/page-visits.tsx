"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

const data = [
  { date: "01/01", pageviews: 1200, uniqueVisitors: 800 },
  { date: "01/02", pageviews: 1300, uniqueVisitors: 900 },
  { date: "01/03", pageviews: 1400, uniqueVisitors: 1000 },
  { date: "01/04", pageviews: 1350, uniqueVisitors: 950 },
  { date: "01/05", pageviews: 1450, uniqueVisitors: 1050 },
  { date: "01/06", pageviews: 1500, uniqueVisitors: 1100 },
  { date: "01/07", pageviews: 1550, uniqueVisitors: 1150 },
  { date: "01/08", pageviews: 1600, uniqueVisitors: 1200 },
  { date: "01/09", pageviews: 1650, uniqueVisitors: 1250 },
  { date: "01/10", pageviews: 1700, uniqueVisitors: 1300 },
  { date: "01/11", pageviews: 1750, uniqueVisitors: 1350 },
  { date: "01/12", pageviews: 1800, uniqueVisitors: 1400 },
  { date: "01/13", pageviews: 1850, uniqueVisitors: 1450 },
  { date: "01/14", pageviews: 1900, uniqueVisitors: 1500 },
]

export function PageVisits() {
  return (
    <Card className="border border-border/40 bg-card/80 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Page Views</CardTitle>
            <CardDescription className="mt-1.5 text-xs">Website traffic analytics</CardDescription>
          </div>
          <Tabs defaultValue="7d" className="w-[150px]">
            <TabsList className="grid h-auto grid-cols-3">
              <TabsTrigger value="7d" className="text-xs">
                7D
              </TabsTrigger>
              <TabsTrigger value="14d" className="text-xs">
                14D
              </TabsTrigger>
              <TabsTrigger value="30d" className="text-xs">
                30D
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 10,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#444" vertical={false} />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e1e1e",
                  borderColor: "#333",
                  borderRadius: "4px",
                }}
                itemStyle={{ color: "#fff" }}
                labelStyle={{ color: "#aaa" }}
              />
              <Area
                type="monotone"
                dataKey="pageviews"
                name="Total Page Views"
                stackId="1"
                stroke="#8884d8"
                fill="#8884d8"
                fillOpacity={0.5}
              />
              <Area
                type="monotone"
                dataKey="uniqueVisitors"
                name="Unique Visitors"
                stackId="2"
                stroke="#82ca9d"
                fill="#82ca9d"
                fillOpacity={0.5}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
