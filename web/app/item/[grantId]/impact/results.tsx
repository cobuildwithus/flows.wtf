import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { Impact } from "@prisma/flows"
import { CircleCheckBig, CircleX } from "lucide-react"

interface Props {
  impact: Impact
}

export function ResultsSection(props: Props) {
  const { impact } = props
  const { results } = impact

  const hasResults = results.length > 0

  return (
    <div className="flex flex-col gap-y-4">
      <h3 className="text-xs font-medium uppercase tracking-wide opacity-85">Results</h3>
      {hasResults ? (
        <ul className="flex flex-col space-y-3">
          {results.map((result) => (
            <li key={result.headline} className="flex items-start">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="inline-flex cursor-help items-center space-x-2.5 text-sm">
                    <CircleCheckBig className="size-4 text-green-400/75" />
                    <span className="font-light opacity-85">{result.headline}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs py-2">{result.details}</TooltipContent>
              </Tooltip>
            </li>
          ))}
        </ul>
      ) : (
        <div className="inline-flex cursor-help items-center space-x-2.5 text-sm">
          <CircleX className="size-4 text-gray-400/75" />
          <span className="font-light opacity-85">No clear results</span>
        </div>
      )}
    </div>
  )
}
