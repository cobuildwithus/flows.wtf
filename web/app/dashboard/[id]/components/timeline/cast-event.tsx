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
      <a
        href={`https://farcaster.xyz/${cast.profile.fname}/0x${Buffer.from(new Uint8Array(cast.hash)).toString("hex")}`}
        target="_blank"
        rel="noreferrer"
      >
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
      </a>
    </>
  )
}
