import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { Impact } from "@prisma/flows"
import pluralize from "pluralize"

interface Props {
  impact: Impact
}

export function ImpactMetrics(props: Props) {
  const { impact } = props
  const { impactMetrics } = impact

  const filteredMetrics = impactMetrics.filter(
    ({ name, value }) => name.toLowerCase() !== "noggles" && Number(value) > 0,
  )

  const sortedMetrics = filteredMetrics.sort((a, b) => {
    const aShowsUnits = showUnits(a) ? 0 : 1
    const bShowsUnits = showUnits(b) ? 0 : 1
    return aShowsUnits - bShowsUnits
  })

  return (
    <section className="mt-8">
      <h3 className="text-xs font-medium uppercase tracking-wide opacity-85">Impact</h3>
      <dl className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {sortedMetrics.map((unit) => (
          <div key={unit.name} className="rounded-md border p-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex h-full cursor-help flex-col items-start justify-start gap-y-2.5">
                  <dt className="text-xs text-muted-foreground">{formatName(unit)}</dt>
                  <dd className="order-first text-3xl font-bold tracking-tight">
                    {unit.value}
                    <span className="ml-1.5 text-xs font-normal opacity-75">
                      {formatUnits(unit)}
                    </span>
                  </dd>
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs py-2">
                <p className="text-xs">{unit.reasoning}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        ))}
      </dl>
    </section>
  )
}

function formatUnits(unit: Impact["impactMetrics"][number]) {
  if (showUnits(unit)) {
    return pluralize(unit.units, Number.parseInt(unit.value))
  }
}

function showUnits(unit: Impact["impactMetrics"][number]) {
  const unitName = unit.name.toLowerCase()
  const unitLabel = unit.units.toLowerCase()

  // Special handling for "person" and "people"
  if (unitLabel === "person" || unitLabel === "people") {
    const regex = new RegExp(`\\b(${unitLabel}|people|participant|participants)\\b`, "i")
    return !regex.test(unitName)
  }

  // Special handling for singular/plural forms
  const singularForm = pluralize.singular(unitLabel)
  const pluralForm = pluralize.plural(unitLabel)

  // Check if either singular or plural form is in the name
  const regex = new RegExp(`\\b(${singularForm}|${pluralForm})\\b`, "i")

  // Don't show units if the unit name already includes the unit label (singular or plural)
  return !regex.test(unitName)
}

function formatName(unit: Impact["impactMetrics"][number]) {
  if (unit.name.toLowerCase().startsWith("people") && unit.value === "1") {
    return `Person ${unit.name.slice(6)}`
  }
  return unit.name
}
