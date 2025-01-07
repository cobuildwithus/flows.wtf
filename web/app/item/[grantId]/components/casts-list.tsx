import { CastCard } from "@/components/ui/cast-card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Cast, Profile } from "@prisma/farcaster"
import { EmptyState } from "@/components/ui/empty-state"

interface Props {
  casts: (Cast & { profile: Profile })[]
  buttonText: string
}

export function CastsList(props: Props) {
  const { casts, buttonText } = props

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="link"
          className="h-auto p-0 font-normal text-muted-foreground max-sm:text-sm"
        >
          {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] sm:max-w-screen-lg">
        <DialogHeader>
          <DialogTitle className="text-center text-lg font-medium">Updates</DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto">
          {casts.length === 0 ? (
            <EmptyState
              title="No updates yet"
              description="There are no updates posted for this grant yet."
            />
          ) : (
            (() => {
              // 1. Group casts by their date (YYYY-MM-DD).
              const groupedByDate: Record<string, (Cast & { profile: Profile })[]> = {}
              casts.forEach((cast) => {
                const dateKey = new Date(cast.timestamp).toISOString().split("T")[0]
                if (!groupedByDate[dateKey]) groupedByDate[dateKey] = []
                groupedByDate[dateKey].push(cast)
              })

              // 2. Sort date groups. Change this comparison if you want oldest-first instead.
              const sortedDates = Object.keys(groupedByDate).sort(
                (a, b) => new Date(b).getTime() - new Date(a).getTime(),
              )

              // 3. Render them top-to-bottom. CSS columns will handle multi-col layout.
              return (
                <div className="mt-4 columns-1 gap-2.5 space-y-2.5 sm:columns-2 lg:columns-3">
                  {sortedDates.map((dateKey) => {
                    const dateCasts = groupedByDate[dateKey]
                    return (
                      // Use `break-inside-avoid` so each date group stays together in multi-col.
                      <div key={dateKey} className="mb-4 break-inside-avoid">
                        {dateCasts.map((cast) => (
                          <CastCard key={cast.hash.toString("hex")} cast={cast} />
                        ))}
                      </div>
                    )
                  })}
                </div>
              )
            })()
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
