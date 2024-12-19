import { cn } from "@/lib/utils"

interface Props {
  key_points: string[]
  className?: string
}

export function KeyPoints(props: Props) {
  const { key_points, className } = props

  if (!key_points || key_points.length === 0) {
    return null
  }

  return (
    <div className={cn(className)}>
      <h2 className="text-sm font-medium text-muted-foreground">Key facts</h2>
      <ul className="mt-4 space-y-4">
        {key_points.map((point, index) => (
          <li key={point} className="flex items-start">
            <span className="mr-3.5 mt-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              {index + 1}
            </span>
            <span className="text-sm">{point}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
