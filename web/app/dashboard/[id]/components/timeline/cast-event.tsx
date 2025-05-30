import { CastMediaCarousel, CastText } from "@/components/ui/cast-card"
import { DateTime } from "@/components/ui/date-time"
import { MinimalCast } from "@/lib/types/cast"
import { TimelineIndicator } from "./timeline-indicator"

interface Props {
  cast: MinimalCast
  date: Date
}

export async function CastEvent({ cast, date }: Props) {
  return (
    <>
      <TimelineIndicator image={cast.profile?.avatar_url} />
      <div className="rounded-md border p-3.5">
        <div className="flex justify-between gap-x-4">
          <div className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">
              {cast.profile?.display_name || "User"}
            </span>{" "}
            posted
          </div>
          <DateTime date={date} relative short className="text-xs text-muted-foreground" />
        </div>
        <CastText cast={cast} className="mt-2 text-sm text-muted-foreground" />
        <CastMediaCarousel cast={cast} />
      </div>
    </>
  )
}
