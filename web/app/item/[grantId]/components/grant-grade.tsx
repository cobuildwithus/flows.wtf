import { isGrantNew } from "@/app/flow/[flowId]/components/is-new"
import type { DerivedData, Grant } from "@prisma/flows"
import { CircularProgress } from "./circular-progress"
import { ImpactDialog } from "./grades-dialog"
import { NewProgress } from "./new-progress"

interface Props {
  grant: Pick<Grant, "id" | "title" | "image" | "activatedAt"> & {
    derivedData: Pick<DerivedData, "overallGrade" | "requirementsMetrics"> | null
  }
}

export function GrantGrade({ grant }: Props) {
  const isNew = isGrantNew(grant)

  const { derivedData } = grant

  if (!derivedData?.overallGrade)
    return (
      <div className="mb-6 flex items-center space-x-2.5 text-sm max-lg:justify-center">
        <div className="relative size-7">
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
    )

  return (
    <ImpactDialog grants={[grant]}>
      <button className="transition-opacity hover:opacity-75">
        {!isNew && <CircularProgress value={Math.ceil(derivedData.overallGrade)} size={42} />}
        {isNew && <NewProgress />}
      </button>
    </ImpactDialog>
  )
}
