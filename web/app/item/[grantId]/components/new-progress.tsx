import { Icon } from "@/components/ui/icon"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

interface Props {
  size?: number
  className?: string
  disableTooltip?: boolean
}

function ProgressCircle({ size = 48, className }: Pick<Props, "size" | "className">) {
  return (
    <div className={cn("relative rounded-full", className)} style={{ width: size, height: size }}>
      <svg className="size-full" viewBox="0 0 100 100">
        <circle
          className="fill-none stroke-blue-200 dark:stroke-blue-900"
          strokeWidth="6"
          cx="50"
          cy="50"
          r="45"
        />
        <circle
          className="fill-none stroke-blue-500 dark:stroke-blue-400"
          strokeWidth="6"
          strokeLinecap="round"
          cx="50"
          cy="50"
          r="45"
          strokeDasharray="8,8"
          transform="rotate(-90 50 50)"
        />
      </svg>
    </div>
  )
}

export function NewProgress({ size = 48, className, disableTooltip }: Props) {
  if (disableTooltip) {
    return <ProgressCircle size={size} className={className} />
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <ProgressCircle size={size} className={className} />
      </TooltipTrigger>
      <TooltipContent>New</TooltipContent>
    </Tooltip>
  )
}
