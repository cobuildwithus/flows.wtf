import { cn } from "@/lib/utils"
import { Grant } from "@prisma/flows"
import { Grade } from "./grade"

interface Props {
  grant: Pick<Grant, "id">
}

export function Grades(props: Props) {
  const { grant } = props

  return (
    <div className="space-y-6 rounded-xl border bg-card p-5">
      <div className="flex items-center space-x-4">
        <CircularProgress value={80} />
        <span className="font-medium">Overall Score</span>
      </div>

      <div className="space-y-4">
        <Grade label="Impact Score" value={8} percentage={80} />
        <Grade label="Communication" value={60} percentage={70} />
        <Grade label="Code Quality" value="D" percentage={60} />
        <Grade label="Number of Users" value={15000} percentage={30} />
      </div>
    </div>
  )
}

function CircularProgress({ value }: { value: number }) {
  return (
    <div className="relative size-12">
      <svg className="size-full" viewBox="0 0 100 100">
        <circle className="fill-none stroke-muted" strokeWidth="6" cx="50" cy="50" r="45" />
        <circle
          className={cn("fill-none transition-all", {
            "stroke-green-500 dark:stroke-green-400": value >= 75,
            "stroke-yellow-500 dark:stroke-yellow-400": value >= 50 && value < 75,
            "stroke-red-500 dark:stroke-red-400": value < 50,
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
            "text-green-500 dark:text-green-400": value >= 75,
            "text-yellow-500 dark:text-yellow-400": value >= 50 && value < 75,
            "text-red-500 dark:text-red-400": value < 50,
          })}
        >
          {value}
        </span>
      </div>
    </div>
  )
}
