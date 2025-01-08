import { cn } from "@/lib/utils"

export function CircularProgress({ value }: { value: number }) {
  return (
    <div className="relative size-12">
      <svg className="size-full" viewBox="0 0 100 100">
        <circle className="fill-none stroke-muted" strokeWidth="6" cx="50" cy="50" r="45" />
        <circle
          className={cn("fill-none transition-all", {
            "stroke-green-500 dark:stroke-green-400": value >= 80,
            "stroke-yellow-500 dark:stroke-yellow-400": value >= 60 && value < 80,
            "stroke-red-500 dark:stroke-red-400": value < 60,
          })}
          strokeWidth="6"
          strokeLinecap="round"
          cx="50"
          cy="50"
          r="45"
          strokeDasharray={`${(value / 100) * 2 * Math.PI * 45}, ${2 * Math.PI * 45}`}
          transform="rotate(-90 50 50)"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className={cn("text-lg font-bold", {
            "text-green-500 dark:text-green-400": value >= 80,
            "text-yellow-500 dark:text-yellow-400": value >= 60 && value < 80,
            "text-red-500 dark:text-red-400": value < 60,
          })}
        >
          {value}
        </span>
      </div>
    </div>
  )
}
