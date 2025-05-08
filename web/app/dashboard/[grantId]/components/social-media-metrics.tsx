"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

const data = [
  { month: "Jan", twitter: 1200, tiktok: 1800, youtube: 800, warpcast: 400 },
  { month: "Feb", twitter: 1300, tiktok: 2000, youtube: 850, warpcast: 450 },
  { month: "Mar", twitter: 1400, tiktok: 2200, youtube: 900, warpcast: 500 },
  { month: "Apr", twitter: 1350, tiktok: 2400, youtube: 950, warpcast: 550 },
  { month: "May", twitter: 1450, tiktok: 2600, youtube: 1000, warpcast: 600 },
  { month: "Jun", twitter: 1500, tiktok: 2800, youtube: 1050, warpcast: 650 },
  { month: "Jul", twitter: 1550, tiktok: 3000, youtube: 1100, warpcast: 700 },
  { month: "Aug", twitter: 1600, tiktok: 3200, youtube: 1150, warpcast: 750 },
  { month: "Sep", twitter: 1650, tiktok: 3400, youtube: 1200, warpcast: 800 },
  { month: "Oct", twitter: 1700, tiktok: 3600, youtube: 1250, warpcast: 850 },
  { month: "Nov", twitter: 1750, tiktok: 3800, youtube: 1300, warpcast: 900 },
  { month: "Dec", twitter: 1800, tiktok: 4000, youtube: 1350, warpcast: 950 },
]

export function SocialMediaMetrics() {
  return (
    <Card className="border border-border/40 bg-card/80 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Social Media Metrics</CardTitle>
            <CardDescription className="mt-1.5 text-xs">
              Follower growth across platforms
            </CardDescription>
          </div>
          <Tabs defaultValue="3m" className="w-[150px]">
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
      <CardContent className="pb-4">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
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
                labelStyle={{ color: "#aaa" }}
              />
              <Legend
                verticalAlign="top"
                height={36}
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: "12px" }}
              />
              <Line
                type="monotone"
                dataKey="twitter"
                name="X (Twitter)"
                stroke="#1DA1F2"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="tiktok"
                name="TikTok"
                stroke="#EE1D52"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="youtube"
                name="YouTube"
                stroke="#FF0000"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="warpcast"
                name="Warpcast"
                stroke="#8A2BE2"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
