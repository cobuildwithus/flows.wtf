import * as React from "react"
import { cn } from "@/lib/utils"

interface PercentChangeProps {
  value: number
  className?: string
  showSign?: boolean
}

const PercentChange = React.forwardRef<HTMLSpanElement, PercentChangeProps>(
  ({ value, className, showSign = true, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "font-semibold",
        value > 0 ? "text-green-600" : value < 0 ? "text-red-400" : "text-muted-foreground",
        className,
      )}
      {...props}
    >
      {showSign && value > 0 ? "+" : ""}
      {value.toFixed(1)}%
    </span>
  ),
)
PercentChange.displayName = "PercentChange"

export { PercentChange }
