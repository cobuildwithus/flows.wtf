import { cn } from "@/lib/utils"
import { Grant, DerivedData } from "@prisma/flows"
import { Grade } from "./grade"

interface Props {
  grant: Pick<Grant, "id"> & { derivedData: Pick<DerivedData, "grades"> | null }
}

interface Grades {
  [key: string]: {
    score: number
    explanation: string
  }
}

export function Grades(props: Props) {
  const { grant } = props

  if (!grant.derivedData?.grades) return <PendingEvaluation />

  const grades = grant.derivedData?.grades as unknown as Grades

  const overallScore = grades
    ? Math.ceil(
        Object.values(grades).reduce((acc, { score }) => acc + score, 0) /
          Object.keys(grades).length,
      )
    : 0

  return (
    <div className="space-y-6 rounded-xl border bg-card p-5">
      <div className="flex items-center space-x-4">
        <CircularProgress value={overallScore} />
        <span className="font-medium">Impact Score</span>
      </div>

      <div className="space-y-4">
        {Object.entries(grades)
          .sort(([, a], [, b]) => b.score - a.score)
          .map(([label, { score, explanation }]) => (
            <Grade
              key={label}
              label={label}
              value={score}
              percentage={score}
              explanation={explanation}
            />
          ))}
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
            "stroke-green-500 dark:stroke-green-400": value >= 80,
            "stroke-yellow-500 dark:stroke-yellow-400": value >= 50 && value < 80,
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
            "text-green-500 dark:text-green-400": value >= 80,
            "text-yellow-500 dark:text-yellow-400": value >= 50 && value < 80,
            "text-red-500 dark:text-red-400": value < 50,
          })}
        >
          {value}
        </span>
      </div>
    </div>
  )
}

export function PendingEvaluation() {
  return (
    <div className="w-full rounded-xl border bg-card p-6 text-center">
      <div className="mb-6 flex items-center space-x-4">
        <div className="relative size-12">
          <svg className="size-full" viewBox="0 0 100 100">
            <circle className="fill-none stroke-muted" strokeWidth="6" cx="50" cy="50" r="45" />
          </svg>
        </div>
        <span className="font-medium">Pending Evaluation</span>
      </div>
      <div className="space-y-4">
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>Grades will appear here once the grant has been evaluated by our AI system.</p>
          <p>This happens after a builder posts their first update.</p>
        </div>
      </div>
    </div>
  )
}
