"use client"

import { Card, CardContent } from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import Image from "next/image"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

interface Props {
  data: (PrismaJson.ImpactMetric & { date: string; weight: number })[]
  summary: PrismaJson.ImpactSummary
  backgroundImage: string
  gradients: PrismaJson.Gradient[]
}

interface Serie {
  units: string
  weight: number
  name: string
}

export function ImpactSummaryChart(props: Props) {
  const { data, summary, backgroundImage, gradients } = props

  const series = data
    .filter((item) => Number(item.value) > 0)
    .reduce((acc, item) => {
      if (!acc.some((u) => u.units === item.units)) {
        acc.push({ units: item.units, weight: item.weight, name: item.name })
      }
      return acc
    }, [] as Serie[])

  const { weightedData, originalData } = processChartData(data, series, summary.timeUnit)

  const chartConfig = series.reduce(
    (config, unitInfo, index) => ({
      ...config,
      [unitInfo.units]: {
        label: unitInfo.name || unitInfo.units,
        color: gradients[index]?.light.gradientStart || `hsl(var(--chart-${index}))`,
      },
    }),
    {} satisfies ChartConfig,
  )

  return (
    <Card className="flex h-full flex-col items-center justify-center">
      <CardContent className="relative flex h-full w-full !p-0">
        <div className="order-last flex w-[256px] shrink-0 flex-col gap-4 divide-y">
          {summary.metricSummaries
            .filter((m) => m.value > 0)
            .map((metric) => (
              <button
                key={metric.metricId}
                className="flex grow flex-col justify-center gap-1 px-6 py-4 text-left"
                // onClick={() => setActiveChart(chart)}
              >
                <span className="text-xs text-muted-foreground">
                  {metric.aggregationType === "total" ? "in total" : "on average"}
                </span>
                <span className="mt-0.5 text-lg font-bold leading-none">{metric.value}</span>
                <span className="mt-1.5 text-xs text-muted-foreground">{metric.explanation}</span>
              </button>
            ))}
        </div>

        <div className="relative grow">
          <Image
            src={backgroundImage}
            alt=" "
            width="764"
            height="330"
            className="absolute inset-0 h-full w-full object-cover mix-blend-overlay"
          />
          <ChartContainer config={chartConfig} className="max-h-[330px] min-h-[270px] w-full p-4">
            <BarChart
              accessibilityLayer
              data={weightedData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid vertical={false} horizontal={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                minTickGap={32}
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    ...(summary.timeUnit === "months" && { day: undefined }),
                  })
                }}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <CustomTooltipContent
                    indicator="dot"
                    originalData={originalData}
                    series={series}
                  />
                }
              />
              {series.map((serie, i) => (
                <Bar
                  key={serie.units}
                  dataKey={serie.units}
                  fill={`var(--color-${serie.units})`}
                  radius={
                    series.length > 1
                      ? i === 0
                        ? [0, 0, 4, 4]
                        : i === series.length - 1
                          ? [4, 4, 0, 0]
                          : 0
                      : 4
                  }
                  minPointSize={i === series.length - 1 ? 10 : 0}
                  stackId="a"
                />
              ))}
              <ChartLegend content={<ChartLegendContent />} />
            </BarChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  )
}

function CustomTooltipContent({
  active,
  payload,
  label,
  indicator,
  originalData,
  series,
}: {
  active?: boolean
  payload?: any[]
  label?: string
  indicator?: "line" | "dot" | "dashed"
  originalData: Map<string, { [key: string]: number | string }>
  series: Serie[]
}) {
  if (!active || !payload || !payload.length || !label) return null

  return (
    <ChartTooltipContent
      indicator={indicator}
      active={active}
      payload={payload.map((entry) => ({
        ...entry,
        value: originalData.get(label)?.[entry.dataKey] ?? entry.value,
        name: series.find((s) => s.units === entry.dataKey)?.name || entry.name,
      }))}
      label={label}
    />
  )
}

function processChartData(
  metrics: Props["data"],
  series: Serie[],
  timeUnit: "weeks" | "months",
): {
  weightedData: Array<{ date: string; [key: string]: number | string }>
  originalData: Map<string, { [key: string]: number | string }>
} {
  const weightedDataMap = new Map<string, { date: string; [key: string]: number | string }>()
  const originalDataMap = new Map<string, { [key: string]: number | string }>()

  const initializePeriod = (period: string) => ({
    date: period,
    ...Object.fromEntries(series.map((serie) => [serie.units, 0])),
  })

  const today = new Date()
  let periods: string[] = []

  if (timeUnit === "weeks") {
    // For weeks, start from the most recent Sunday
    const lastSunday = new Date(today)
    lastSunday.setDate(today.getDate() - today.getDay())
    lastSunday.setHours(0, 0, 0, 0)

    // Generate the last 12 weeks' Sunday dates
    for (let i = 11; i >= 0; i--) {
      const date = new Date(lastSunday)
      date.setDate(lastSunday.getDate() - i * 7)
      periods.push(date.toISOString().slice(0, 10))
    }
  } else {
    // For months, start from the current month
    for (let i = 11; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1)
      periods.push(date.toISOString().slice(0, 7))
    }
  }

  // Initialize all periods
  periods.forEach((period) => {
    weightedDataMap.set(period, initializePeriod(period))
    originalDataMap.set(period, initializePeriod(period))
  })

  for (const item of metrics) {
    const itemDate = new Date(item.date)
    let period: string

    if (timeUnit === "weeks") {
      // Find the Sunday that starts this week
      const sunday = new Date(itemDate)
      sunday.setDate(itemDate.getDate() - itemDate.getDay())
      sunday.setHours(0, 0, 0, 0)
      period = sunday.toISOString().slice(0, 10)
    } else {
      period = itemDate.toISOString().slice(0, 7)
    }

    // Only process if this period is in our range
    if (weightedDataMap.has(period)) {
      const weightedPeriodData = weightedDataMap.get(period)!
      const originalPeriodData = originalDataMap.get(period)!
      const value = Number(item.value)

      weightedPeriodData[item.units] =
        ((weightedPeriodData[item.units] as number) || 0) + value * item.weight
      originalPeriodData[item.units] = ((originalPeriodData[item.units] as number) || 0) + value
    }
  }

  return {
    weightedData: periods.map((period) => weightedDataMap.get(period)!),
    originalData: originalDataMap,
  }
}
