import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface Props {
  label: string
  value: number | string
  percentage: number
  isNew?: boolean
}

export function Grade(props: Props) {
  const { label, value, percentage, isNew } = props

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="font-medium capitalize tracking-tight text-muted-foreground">{label}</span>
        <span
          className={cn("font-medium", {
            "text-green-500": percentage >= 80,
            "text-yellow-500 dark:text-yellow-300": percentage < 80,
            "text-blue-500": isNew && percentage < 80,
          })}
        >
          {value}
        </span>
      </div>
      <Progress
        value={percentage}
        className="h-1.5"
        indicatorClassName={cn({
          "bg-green-500/90 dark:bg-green-500/70": percentage >= 80,
          "bg-yellow-500/90 dark:bg-yellow-500/70": percentage < 80,
          "bg-blue-500/90 dark:bg-blue-500/70": isNew && percentage < 80,
        })}
      />
    </div>
  )
}
