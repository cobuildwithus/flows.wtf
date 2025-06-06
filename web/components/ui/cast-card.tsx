"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { DateTime } from "@/components/ui/date-time"
import { useCastsText } from "@/lib/casts/use-casts-text"
import { getCastImages } from "@/lib/farcaster/get-cast-images"
import { getCastVideos } from "@/lib/farcaster/get-cast-videos"
import type { MinimalCast } from "@/lib/types/cast"
import { cn } from "@/lib/utils"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "./carousel"
import { ImpactVerification } from "./impact-verification/impact-verification"
import { VideoPlayer } from "./video-player"

interface Props {
  cast: MinimalCast
  showVerification?: boolean
}

export const CastCard = (props: Props) => {
  const { cast, showVerification = true } = props

  return (
    <>
      <Card
        className={cn("w-full break-inside-avoid", {
          "rounded-b-none": showVerification,
        })}
      >
        <a
          href={`https://farcaster.xyz/${cast.profile.fname}/0x${Buffer.from(new Uint8Array(cast.hash)).toString("hex")}`}
          target="_blank"
          className="block"
          rel="noreferrer"
        >
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
        </a>

        <CardContent className="!pt-4">
          <CastText cast={cast} />
          <CastMediaCarousel cast={cast} />
        </CardContent>
      </Card>

      {showVerification && <ImpactVerification cast={cast} />}
    </>
  )
}

export const CastText = (props: Props & { className?: string }) => {
  const { cast, className } = props

  const { text } = useCastsText({
    text: cast.text || "",
    mentionsPositions: cast.mentions_positions_array,
    mentionedFids: cast.mentioned_fids,
  })

  return (
    <div className={cn("overflow-hidden text-ellipsis whitespace-pre-line text-sm", className)}>
      {text || cast.text}
    </div>
  )
}

export const CastMediaCarousel = (props: Props) => {
  const { cast } = props
  const videos = getCastVideos(cast)
  const images = getCastImages(cast)

  if ((videos.length || 0) === 0 && (images.length || 0) === 0) {
  }

  return (
    <div className="mt-4">
      <Carousel className="w-full">
        <CarouselContent>
          {[...videos, ...images].map((media) => (
            <CarouselItem key={media}>
              {videos.includes(media) ? (
                <div
                  className={cn(
                    "relative h-0 w-full overflow-hidden rounded-lg pb-[350px] md:max-h-[400px]",
                  )}
                >
                  <VideoPlayer
                    url={media}
                    width="100%"
                    height="100%"
                    style={{ position: "absolute", top: 0, left: 0 }}
                    controls
                  />
                </div>
              ) : (
                <div className="flex h-full w-full items-center justify-center overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={media}
                    alt=""
                    className="h-auto max-h-[350px] w-auto max-w-full rounded-md object-contain"
                    loading="lazy"
                  />
                </div>
              )}
            </CarouselItem>
          ))}
        </CarouselContent>
        {videos.length + images.length > 1 && (
          <>
            <CarouselPrevious className="left-2 top-2 z-10" />
            <CarouselNext className="right-2 top-2 z-10" />
          </>
        )}
      </Carousel>
    </div>
  )
}
