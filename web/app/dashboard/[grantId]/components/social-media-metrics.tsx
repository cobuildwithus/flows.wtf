"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { GeneralLinkIcon } from "@/components/ui/general-link-icon"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"

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

const chartConfig = {
  twitter: {
    label: (
      <span className="flex items-center gap-1">
        <GeneralLinkIcon name="twitter" className="size-3.5" />X (Twitter)
      </span>
    ),
    color: "#1DA1F2",
  },
  tiktok: {
    label: (
      <span className="flex items-center gap-1">
        <GeneralLinkIcon name="tiktok" className="size-3.5" />
        TikTok
      </span>
    ),
    color: "#EE1D52",
  },
  youtube: {
    label: (
      <span className="flex items-center gap-1">
        <GeneralLinkIcon name="youtube" className="size-3.5" />
        YouTube
      </span>
    ),
    color: "#FF0000",
  },
  warpcast: {
    label: (
      <span className="flex items-center gap-1">
        <GeneralLinkIcon name="globe" className="size-3.5" />
        Warpcast
      </span>
    ),
    color: "#8A2BE2",
  },
} as const

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
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <ChartContainer config={chartConfig}>
          <LineChart data={data}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend
              verticalAlign="top"
              height={36}
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: "12px" }}
            />
            <Line
              type="monotone"
              dataKey="twitter"
              stroke="var(--color-twitter)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="tiktok"
              stroke="var(--color-tiktok)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="youtube"
              stroke="var(--color-youtube)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="warpcast"
              stroke="var(--color-warpcast)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
