import { ImpactDialog } from "@/app/item/[grantId]/impact/impact-dialog"
import { Submenu } from "@/components/global/submenu"
import database from "@/lib/database/flows-db"
import { FlowImpactSummaryItem } from "./flow-impact-summary-item"
import { FlowImpactSummaryMonth } from "./flow-impact-summary-month"
import "./flow-impact-summary.css"

interface Props {
  flowId: string
  impactMonthly: PrismaJson.ImpactMonthly[]
  subgrantsIds: string[]
  date: string | undefined
  impactId: string | undefined
}

const itemSize = {
  mobile: 120,
  desktop: 200,
}

const monthFormatter = new Intl.DateTimeFormat("en-US", { month: "long" })

export async function FlowImpactSummary(props: Props) {
  const { flowId, subgrantsIds, impactMonthly, impactId } = props

  const impacts = await database.impact.findMany({
    where: { complete: true, grantId: { in: subgrantsIds }, deletedAt: null },
    orderBy: { date: "desc" },
    include: { grant: { select: { title: true } } },
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

  // Calculate optimal number of rows based on the number of items
  // Assuming a typical viewport can fit ~8-10 items horizontally at desktop size
  const itemsPerRowEstimate = 10 // Rough estimate of items that fit in one row
  const totalItems = impacts.length

  // If items can fit in a single row, use 1 row. Otherwise use 4 rows for hexagonal layout
  const numRows = totalItems <= itemsPerRowEstimate ? 1 : 4

  if (totalItems === 0) {
    return null
  }

  return (
    <>
      <div className="container mb-6 max-w-6xl">
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
            "--num-rows": numRows,
            "--hex-spacing-x": "0.92",
            "--hex-spacing-y": "0.77",
            "--item-size-mobile": `${itemSize.mobile}px`,
            "--item-size-desktop": `${itemSize.desktop}px`,
            height:
              numRows === 1
                ? "calc(var(--item-size) * 1.3)"
                : "calc(var(--item-size) + var(--item-size) * 0.9 * (var(--num-rows) - 1))",
          } as React.CSSProperties
        }
      >
        {impacts.map((impact, index) => {
          const col = Math.floor(index / numRows)
          const row = index % numRows

          // For single row layout, don't apply hexagonal offset
          const x = numRows === 1 ? col : col + (row % 2) * 0.5
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
              itemSize={itemSize.desktop}
              isActive={date === monthKey}
              isFirstOfMonth={isFirstOfMonth}
            />
          )
        })}
      </div>
      <ImpactDialog impacts={impacts} impactId={impactId} canEdit={false} />
    </>
  )
}
