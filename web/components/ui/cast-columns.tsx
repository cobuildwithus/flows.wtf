import type { ComponentProps } from "react"
import { cn } from "@/lib/utils"
import { CastCard } from "./cast-card"

interface CastColumnsProps {
  casts: ComponentProps<typeof CastCard>["cast"][]
}

export function CastColumns({ casts }: CastColumnsProps) {
  const numColumns = casts.length >= 3 ? 3 : casts.length > 1 ? 2 : 1
  const columns = Array.from(
    { length: numColumns },
    () => [] as ComponentProps<typeof CastCard>["cast"][],
  )

  const sortedCasts = [
    ...casts.filter((cast) => cast.impact_verifications?.some((v) => v.is_grant_update)),
    ...casts.filter((cast) => !cast.impact_verifications?.some((v) => v.is_grant_update)),
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
              <CastCard cast={cast} />
            </div>
          ))}
        </div>
      ))}

      {casts.length === 0 && (
        <p className="col-span-full text-center text-sm text-muted-foreground">No activity found</p>
      )}
    </div>
  )
}
