import type { MinimalCast } from "@/lib/types/cast"
import { cn } from "@/lib/utils"
import { CastCard } from "./cast-card"

interface CastColumnsProps {
  casts: MinimalCast[]
  showVerification?: boolean
  emptyMessage?: string
}

export function CastColumns({
  casts,
  showVerification,
  emptyMessage = "No casts found",
}: CastColumnsProps) {
  const numColumns = casts.length >= 3 ? 3 : casts.length > 1 ? 2 : 1
  const columns = Array.from({ length: numColumns }, () => [] as MinimalCast[])

  const isVerifiedUpdate = (cast: MinimalCast) => {
    // Check new AI model outputs first
    if (cast.ai_model_outputs && cast.ai_model_outputs.length > 0) {
      const output = cast.ai_model_outputs[0].output as { pass?: boolean } | null
      return output?.pass === true
    }
    // Fall back to legacy impact_verifications
    return cast.impact_verifications?.some((v) => v.is_grant_update)
  }

  const sortedCasts = [
    ...casts.filter((cast) => isVerifiedUpdate(cast)),
    ...casts.filter((cast) => !isVerifiedUpdate(cast)),
  ]

  sortedCasts.forEach((cast, index) => {
    columns[index % numColumns].push(cast)
  })

  return (
    <div
      className={cn("mt-4 grid grid-cols-1 gap-4", {
        "sm:grid-cols-2": casts.length > 1 && casts.length < 3,
        "sm:grid-cols-3": casts.length >= 3,
      })}
    >
      {columns.map((column, idx) => (
        <div
          key={column.map((cast) => cast.hash.toString()).join(",")}
          className="flex flex-col gap-4"
        >
          {column.map((cast) => (
            <div key={cast.hash.toString()} className="break-inside-avoid">
              <CastCard cast={cast} showVerification={showVerification} />
            </div>
          ))}
        </div>
      ))}

      {casts.length === 0 && (
        <p className="col-span-full text-center text-xs text-muted-foreground">{emptyMessage}</p>
      )}
    </div>
  )
}
