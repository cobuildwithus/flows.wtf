import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import pluralize from "pluralize"

interface Props {
  sources: string[]
}

export function Sources(props: Props) {
  const { sources } = props

  if (sources.length === 0) return null

  return (
    <Popover>
      <PopoverTrigger>
        <Badge variant="secondary">
          {sources.length} {pluralize("source", sources.length)}
        </Badge>
      </PopoverTrigger>
      <PopoverContent className="w-auto max-w-[90vw] md:max-w-lg" side="bottom" align="start">
        <ul className="space-y-2.5">
          {sources.map((source) => (
            <li key={source}>
              <a
                href={source}
                target="_blank"
                rel="noopener noreferrer"
                className="block truncate text-sm text-muted-foreground underline hover:text-foreground"
              >
                {source}
              </a>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  )
}
