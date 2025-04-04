import "server-only"

import { DerivedData, Grant, Impact } from "@prisma/flows"
import { ImpactSummaryChart } from "./summary/impact-summary-chart"

interface Props {
  grant: Grant & {
    derivedData: Pick<DerivedData, "impactSummary" | "impactMetrics" | "gradients"> | null
  }
  impacts: Impact[]
  flow: Pick<Grant, "title">
}

type ImpactSummaryType = "chart" | "none"

export const ImpactSummary = (props: Props) => {
  const { grant, impacts } = props

  if (!grant.derivedData) return null

  const { impactSummary, impactMetrics, gradients } = grant.derivedData

  const type = getImpactSummaryType(props)

  if (type === "none") return null

  return (
    <ImpactSummaryChart
      data={props.impacts.flatMap((i) =>
        i.impactMetrics.map((metric) => ({
          ...metric,
          date: i.date.toISOString().split("T")[0],
          weight: impactMetrics!.find((m) => m.units === metric.units)?.weight || 1,
        })),
      )}
      summary={impactSummary!}
      backgroundImage={impacts[impacts.length - 1].bestImage.illustration?.url || grant.image}
      gradients={Object.values(gradients || {})}
    />
  )
}

export function getImpactSummaryType(props: Props): ImpactSummaryType {
  const { grant, impacts, flow } = props

  if (!grant.derivedData) return "none"
  if (flow.title === "Nouns Art") return "none"

  const { impactSummary } = grant.derivedData

  if (impactSummary && impacts.some((i) => i.impactMetrics.some((m) => Number(m.value) > 0))) {
    return "chart"
  }

  return "none"
}
