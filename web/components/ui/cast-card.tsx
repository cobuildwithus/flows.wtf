"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { DateTime } from "@/components/ui/date-time"
import { useCastsText } from "@/lib/casts/use-casts-text"
import { getCastImages } from "@/lib/farcaster/get-cast-images"
import { getCastVideos } from "@/lib/farcaster/get-cast-videos"
import { Cast, Profile } from "@prisma/farcaster"
import { Grant } from "@prisma/flows"
import { VideoPlayer } from "./video-player"
import { Carousel, CarouselItem, CarouselContent, CarouselNext, CarouselPrevious } from "./carousel"
import OpenAI from "@/public/openai.svg"
import Image from "next/image"
import { ImpactVerification } from "./impact-verification"

interface Props {
  cast: Pick<
    Cast,
    | "embeds"
    | "text"
    | "created_at"
    | "hash"
    | "mentions_positions_array"
    | "mentioned_fids"
    | "impact_verifications"
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
    <>
      <Card className="w-full break-inside-avoid rounded-b-none">
        <a
          href={`https://warpcast.com/${cast.profile.fname}/0x${Buffer.from(new Uint8Array(cast.hash)).toString("hex")}`}
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
          <div className="overflow-hidden text-ellipsis whitespace-pre-line text-sm">
            {text || cast.text}
          </div>
          {((videos.length || 0) > 0 || (images.length || 0) > 0) && (
            <div className="mt-4">
              <Carousel className="w-full">
                <CarouselContent>
                  {videos.map((video) => (
                    <CarouselItem key={video}>
                      <div className="h-auto w-full overflow-hidden rounded-lg">
                        <VideoPlayer url={video} width="100%" height="100%" controls />
                      </div>
                    </CarouselItem>
                  ))}
                  {images.map((image) => (
                    <CarouselItem key={image}>
                      <div className="flex h-full w-full items-center justify-center overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={image}
                          alt=""
                          className="h-auto max-h-[350px] w-auto max-w-full rounded-md object-contain"
                          loading="lazy"
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                {(videos.length || images.length) > 1 && (
                  <>
                    <CarouselPrevious className="left-2 top-1/2" />
                    <CarouselNext className="right-2 top-1/2" />
                  </>
                )}
              </Carousel>
            </div>
          )}
        </CardContent>
      </Card>

      <ImpactVerification cast={cast} />
    </>
  )
}
