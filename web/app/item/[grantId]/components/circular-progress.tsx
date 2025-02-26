import { cn } from "@/lib/utils"

interface Props {
  value: number
  size?: number
  className?: string
}

export function CircularProgress(props: Props) {
  const { value, size = 48, className } = props
  const noggleCutoff = 97

  const meetsCutoff = value >= noggleCutoff

  return (
    <div className={cn("relative rounded-full", className)} style={{ width: size, height: size }}>
      <svg className="size-full" viewBox="0 0 100 100">
        <circle className="fill-none stroke-muted" strokeWidth="6" cx="50" cy="50" r="45" />
        <circle
          className={cn("transition-all", {
            "fill-green-500/10 stroke-green-500 dark:fill-green-400/10 dark:stroke-green-400":
              meetsCutoff,
            "fill-none stroke-green-500 dark:stroke-green-400": value >= 80 && !meetsCutoff,
            "fill-none stroke-yellow-500 dark:stroke-yellow-400": value >= 60 && value < 80,
            "fill-none stroke-orange-500 dark:stroke-orange-400": value < 60,
          })}
          strokeWidth="6"
          strokeLinecap="round"
          cx="50"
          cy="50"
          r="45"
          strokeDasharray={
            meetsCutoff
              ? `${2 * Math.PI * 45}, 0`
              : `${(value / 100) * 2 * Math.PI * 45}, ${2 * Math.PI * 45}`
          }
          transform="rotate(-90 50 50)"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {value < noggleCutoff && (
          <span
            className={cn({
              "text-xs font-bold": size <= 28,
              "text-sm font-bold": size === 32,
              "text-base font-bold": size > 32 && size <= 40,
              "text-lg font-bold": size > 40 && size <= 48,
              "text-xl font-bold": size > 48,
              "text-green-500 dark:text-green-400": value >= 80,
              "text-yellow-500 dark:text-yellow-400": value >= 60 && value < 80,
              "text-orange-500 dark:text-orange-400": value < 60,
            })}
          >
            {value.toFixed(0)}
          </span>
        )}
        {value >= noggleCutoff && (
          <svg
            fill="none"
            height={size}
            shapeRendering="crispEdges"
            viewBox="0 0 160 60"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g fill="#22c55e">
              <path d="m90 0h-60v10h60z" />
              <path d="m160 0h-60v10h60z" />
              <path d="m40 10h-10v10h10z" />
            </g>
            <path d="m60 10h-20v10h20z" fill="#fff" />
            <path d="m80 10h-20v10h20z" fill="#000" />
            <path d="m90 10h-10v10h10z" fill="#22c55e" />
            <path d="m110 10h-10v10h10z" fill="#22c55e" />
            <path d="m130 10h-20v10h20z" fill="#fff" />
            <path d="m150 10h-20v10h20z" fill="#000" />
            <path d="m160 10h-10v10h10z" fill="#22c55e" />
            <path d="m40 20h-40v10h40z" fill="#22c55e" />
            <path d="m60 20h-20v10h20z" fill="#fff" />
            <path d="m80 20h-20v10h20z" fill="#000" />
            <path d="m110 20h-30v10h30z" fill="#22c55e" />
            <path d="m130 20h-20v10h20z" fill="#fff" />
            <path d="m150 20h-20v10h20z" fill="#000" />
            <path d="m160 20h-10v10h10z" fill="#22c55e" />
            <path d="m10 30h-10v10h10z" fill="#22c55e" />
            <path d="m40 30h-10v10h10z" fill="#22c55e" />
            <path d="m60 30h-20v10h20z" fill="#fff" />
            <path d="m80 30h-20v10h20z" fill="#000" />
            <path d="m90 30h-10v10h10z" fill="#22c55e" />
            <path d="m110 30h-10v10h10z" fill="#22c55e" />
            <path d="m130 30h-20v10h20z" fill="#fff" />
            <path d="m150 30h-20v10h20z" fill="#000" />
            <path d="m160 30h-10v10h10z" fill="#22c55e" />
            <path d="m10 40h-10v10h10z" fill="#22c55e" />
            <path d="m40 40h-10v10h10z" fill="#22c55e" />
            <path d="m60 40h-20v10h20z" fill="#fff" />
            <path d="m80 40h-20v10h20z" fill="#000" />
            <path d="m90 40h-10v10h10z" fill="#22c55e" />
            <path d="m110 40h-10v10h10z" fill="#22c55e" />
            <path d="m130 40h-20v10h20z" fill="#fff" />
            <path d="m150 40h-20v10h20z" fill="#000" />
            <path d="m160 40h-10v10h10z" fill="#22c55e" />
            <path d="m90 50h-60v10h60z" fill="#22c55e" />
            <path d="m160 50h-60v10h60z" fill="#22c55e" />
          </svg>
        )}
      </div>
    </div>
  )
}
