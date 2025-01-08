export function PendingEvaluation() {
  return (
    <div className="w-full rounded-xl border bg-card p-6 text-center">
      <div className="mb-6 flex items-center space-x-4 max-lg:justify-center">
        <div className="relative size-12">
          <svg className="size-full" viewBox="0 0 100 100">
            <circle
              className="fill-muted/30 stroke-yellow-500 dark:stroke-yellow-400"
              strokeWidth="6"
              cx="50"
              cy="50"
              r="45"
            />
          </svg>
        </div>
        <span className="font-medium">Pending Grade</span>
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
