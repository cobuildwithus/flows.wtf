"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { DateTime } from "@/components/ui/date-time"
import { getCastImages } from "@/lib/farcaster/get-cast-images"
import { getCastVideos } from "@/lib/farcaster/get-cast-videos"
import { Cast, Profile } from "@prisma/farcaster"
import { Grant } from "@prisma/flows"
import { VideoPlayer } from "./video-player"
import { useCastsText } from "@/lib/casts/use-casts-text"

interface Props {
  cast: Pick<
    Cast,
    "embeds" | "text" | "created_at" | "hash" | "mentions_positions_array" | "mentioned_fids"
  > & {
    profile: Pick<Profile, "fname" | "avatar_url" | "display_name">
    grant?: Pick<Grant, "title" | "image"> | null
  }
}

export const CastCard = (props: Props) => {
  const { cast } = props

  const videos = getCastVideos(cast)
  const images = getCastImages(cast)

  const { text } = useCastsText({
    text: cast.text || "",
    mentionsPositions: cast.mentions_positions_array,
    mentionedFids: cast.mentioned_fids,
  })

  return (
    <a
      href={`https://warpcast.com/${cast.profile.fname}/0x${Buffer.from(new Uint8Array(cast.hash)).toString("hex")}`}
      target="_blank"
      className="block"
    >
      <Card className="w-full break-inside-avoid">
        <CardHeader className="flex w-full flex-row items-center justify-between space-x-2.5 space-y-0 pb-2">
          <div className="flex items-center space-x-2.5 truncate">
            <Avatar className="size-8">
              <AvatarImage
                src={cast.profile.avatar_url || ""}
                alt={cast.profile.display_name || ""}
              />
              <AvatarFallback>{cast.profile.display_name?.[0]}</AvatarFallback>
            </Avatar>
            <span className="truncate text-sm font-semibold">{cast.profile.display_name}</span>
          </div>
          <div className="shrink-0">
            <DateTime
              date={cast.created_at}
              relative
              short
              className="text-sm text-muted-foreground"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden text-ellipsis whitespace-pre-line text-sm">
            {text || cast.text}
          </div>

          {((videos.length || 0) > 0 || (images.length || 0) > 0) && (
            <div className="mt-4 grid grid-cols-1 gap-2.5">
              {videos.map((video) => (
                <div key={video} className="h-auto w-full overflow-hidden rounded-lg">
                  <VideoPlayer url={video} width="100%" height="100%" controls />
                </div>
              ))}
              {images.map((image) => (
                <div key={image} className="transition-opacity hover:opacity-80">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image}
                    alt=""
                    className="h-auto w-full max-w-full rounded-lg"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </a>
  )
}
