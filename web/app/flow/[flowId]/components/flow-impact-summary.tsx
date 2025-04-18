import { Submenu } from "@/components/global/submenu"
import database, { getCacheStrategy } from "@/lib/database/edge"
import { FlowImpactSummaryItem } from "./flow-impact-summary-item"
import { FlowImpactSummaryMonth } from "./flow-impact-summary-month"

interface Props {
  flowId: string
  impactMonthly: PrismaJson.ImpactMonthly[]
  subgrantsIds: string[]
  date: string | undefined
}

const numRows = 4
const itemSize = 200

const monthFormatter = new Intl.DateTimeFormat("en-US", { month: "long" })

export async function FlowImpactSummary(props: Props) {
  const { flowId, subgrantsIds, impactMonthly } = props

  const impacts = await database.impact.findMany({
    where: { complete: true, grantId: { in: subgrantsIds } },
    orderBy: { date: "desc" },
    ...getCacheStrategy(1200),
  })

  const months = [...new Set(impacts.map((i) => i.date.toISOString().slice(0, 7)))].sort((a, b) =>
    b.localeCompare(a),
  )

  const date = props.date ?? months[0]

  const monthLinks = months.map((ym) => {
    const [yearStr, monthStr] = ym.split("-")
    return {
      label: monthFormatter.format(new Date(Number(yearStr), Number(monthStr) - 1)),
      href: `/flow/${flowId}/?date=${ym}`,
      isActive: date === ym,
      replace: true,
      scroll: false,
    }
  })

  return (
    <>
      <div className="container mb-6 max-w-6xl">
        <h2 className="text-2xl font-medium tracking-tighter">What we're working on?</h2>
        <FlowImpactSummaryMonth
          date={date}
          summary={impactMonthly?.find((i) => i.date === date)?.summary || ""}
        />

        <Submenu links={monthLinks} className="mt-4" />
      </div>
      <div
        id="impact-container"
        className="relative w-full overflow-x-auto pt-6 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700"
        style={
          {
            "--hex-spacing-x": "0.92",
            "--hex-spacing-y": "0.77",
            height: itemSize + itemSize * 0.9 * (numRows - 1),
          } as React.CSSProperties
        }
      >
        {impacts.map((impact, index) => {
          const col = Math.floor(index / numRows)
          const row = index % numRows

          const x = col + (row % 2) * 0.5
          const y = row
          const delay = index * 0.025

          const monthKey = impact.date.toISOString().slice(0, 7)
          const isFirstOfMonth =
            index === 0 || monthKey !== impacts[index - 1]?.date?.toISOString()?.slice(0, 7)

          return (
            <FlowImpactSummaryItem
              key={impact.id}
              impact={impact}
              x={x}
              y={y}
              delay={delay}
              itemSize={itemSize}
              isActive={date === monthKey}
              isFirstOfMonth={isFirstOfMonth}
            />
          )
        })}
      </div>
    </>
  )
}
