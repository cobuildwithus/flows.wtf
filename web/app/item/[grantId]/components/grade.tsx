import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface Props {
  label: string
  value: number | string
  percentage: number
  explanation: string
}

export function Grade(props: Props) {
  const { label, value, percentage, explanation } = props

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="font-medium capitalize tracking-tight text-muted-foreground">{label}</span>
        <span
          className={cn("font-medium", {
            "text-green-500": percentage >= 75,
            "text-yellow-500 dark:text-yellow-300": percentage >= 50 && percentage < 75,
            "text-red-500": percentage < 50,
          })}
        >
          {value}
        </span>
      </div>
      <Progress
        value={percentage}
        className="h-1.5"
        indicatorClassName={cn({
          "bg-green-500/90 dark:bg-green-500/70": percentage >= 75,
          "bg-yellow-500/90 dark:bg-yellow-500/70": percentage >= 50 && percentage < 75,
          "bg-red-500/90 dark:bg-red-500/70": percentage < 50,
        })}
      />
    </div>
  )
}
