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
import { CalendarRangeIcon } from "lucide-react"
import Image from "next/image"
import { useEffect, useMemo, useState } from "react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import LightChartBg from "@/public/light-chart-bg.png"
import pluralize from "pluralize"

interface Props {
  data: (PrismaJson.ImpactMetric & { date: string; weight: number })[]
  summary: PrismaJson.ImpactSummary
  gradients: PrismaJson.Gradient[]
}

interface Serie {
  units: string
  weight: number
  name: string
}

export function ImpactSummaryChart(props: Props) {
  const { summary, gradients } = props
  const [timeUnit, setTimeUnit] = useState<"weeks" | "months">(summary.timeUnit)

  const data = useMemo(() => props.data.filter((item) => Number(item.value) > 0), [props.data])

  useEffect(() => {
    const style = document.createElement("style")
    style.textContent = generateChartColorVariables(gradients)
    document.head.appendChild(style)
    return () => {
      document.head.removeChild(style)
    }
  }, [gradients])

  const series = useMemo(
    () =>
      data.reduce((acc, item) => {
        if (!acc.some((u) => u.units === item.units)) {
          acc.push({ units: item.units, weight: item.weight, name: item.name })
        }
        return acc
      }, [] as Serie[]),
    [data],
  )

  const { weightedData, originalData } = useMemo(
    () => processChartData(data, series, timeUnit),
    [data, series, timeUnit],
  )

  const chartConfig = useMemo(
    () =>
      series.reduce(
        (config, unitInfo, index) => ({
          ...config,
          [unitInfo.units]: {
            label: unitInfo.name || unitInfo.units,
            color: `var(--chart-color-${index}, hsl(var(--chart-${index})))`,
          },
        }),
        {} satisfies ChartConfig,
      ),
    [series],
  )

  return (
    <Card className="flex h-full flex-col items-center justify-center">
      <CardContent className="relative flex h-full w-full flex-col !p-0 md:flex-row">
        <div className="flex w-full shrink-0 flex-col divide-y border-l md:order-last md:w-[232px]">
          {summary.metricSummaries
            .filter((m) => m.value > 0)
            .map((metric) => (
              <div
                key={metric.metricId + metric.aggregationType}
                className="flex grow flex-col justify-center gap-1 px-4 py-4 text-left"
              >
                <span className="text-xs text-muted-foreground">
                  {metric.aggregationType === "total" ? "in total" : "on average"}
                </span>
                <span className="mt-1 text-base font-medium leading-none">
                  {metric.value}{" "}
                  {metric.units === "people" && metric.value === 1 ? "person" : metric.units}
                </span>
                <span className="mt-1.5 text-xs text-muted-foreground">{metric.explanation}</span>
              </div>
            ))}
        </div>

        <div className="relative overflow-hidden max-sm:w-full lg:grow">
          <Image
            src={LightChartBg}
            alt=" "
            width="764"
            height="330"
            className="absolute inset-0 h-full w-full overflow-hidden rounded-l-lg object-fill mix-blend-overlay"
          />

          <button
            className="absolute left-4 top-4 z-10 flex items-center text-muted-foreground transition-opacity hover:opacity-75 dark:text-white"
            onClick={() => setTimeUnit(timeUnit === "weeks" ? "months" : "weeks")}
          >
            <CalendarRangeIcon className="size-4" />
            <span className="ml-1.5 text-xs">
              {timeUnit === "weeks" ? "Weekly" : "Monthly"} summary
            </span>
          </button>
          <ChartContainer config={chartConfig} className="max-h-[330px] min-h-[270px] w-full p-4">
            <BarChart
              accessibilityLayer
              data={weightedData}
              margin={{ top: 32, right: 6, left: 6, bottom: 6 }}
            >
              <CartesianGrid vertical={false} horizontal={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                minTickGap={32}
                tickFormatter={(value) => {
                  return new Date(value).toLocaleDateString("en-US", {
                    month: "short",
                    day: timeUnit === "weeks" ? "numeric" : undefined,
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
                  fill={`var(--chart-color-${i}, hsl(var(--chart-${i})))`}
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
  payload?: { dataKey: string; value: string | number; name: string }[]
  label?: string
  indicator?: "line" | "dot" | "dashed"
  originalData: Map<string, { [key: string]: number | string }>
  series: Serie[]
}) {
  if (!active || !payload || !payload.length || !label) return null

  return (
    <ChartTooltipContent
      className="max-sm:hidden"
      indicator={indicator}
      active={active}
      payload={payload.map((entry) => {
        const serie = series.find((s) => s.units === entry.dataKey)
        return {
          ...entry,
          value: `${originalData.get(label)?.[entry.dataKey] ?? entry.value} ${pluralize(serie?.units || "", Number(entry.value)) || ""}`,
          name: serie?.name || entry.name,
        }
      })}
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

function getBrighterColor(color1: string, color2: string): string {
  const getLuminance = (hex: string): number => {
    const r = parseInt(hex.slice(1, 3), 16) / 255
    const g = parseInt(hex.slice(3, 5), 16) / 255
    const b = parseInt(hex.slice(5, 7), 16) / 255
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
  }

  const luminance1 = getLuminance(color1)
  const luminance2 = getLuminance(color2)

  return luminance1 > luminance2 ? color1 : color2
}

function getDarkerColor(color1: string, color2: string): string {
  const brighterColor = getBrighterColor(color1, color2)
  return brighterColor === color1 ? color2 : color1
}

function generateChartColorVariables(gradients: PrismaJson.Gradient[]): string {
  return gradients
    .map((gradient, index) => {
      if (!gradient) return ""

      const lightColor = getDarkerColor(gradient.light.gradientStart, gradient.light.gradientEnd)
      const darkColor = getBrighterColor(gradient.dark.gradientStart, gradient.dark.gradientEnd)

      return `
      :root {
        --chart-color-${index}: ${lightColor};
      }
      .dark {
        --chart-color-${index}: ${darkColor};
      }
    `
    })
    .join("\n")
}
