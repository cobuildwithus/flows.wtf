import type { Impact } from "@prisma/flows"
import { CircleCheckBig, CircleX } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

interface Props {
  results: Impact["results"]
}

export function BlockResults(props: Props) {
  const { results } = props

  const hasResults = results.length > 0

  return (
    <section className="flex flex-col gap-y-4 max-md:mt-4">
      <h3 className="text-xs font-medium uppercase tracking-wide opacity-85">Results</h3>
      {hasResults ? (
        <ul className="flex flex-col space-y-3">
          {results.map((result) => (
            <li key={result.headline} className="flex items-start">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="inline-flex cursor-help items-center space-x-2.5 text-sm">
                    <CircleCheckBig className="size-4 text-green-600" />
                    <span>{result.headline}</span>
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
    </section>
  )
}
