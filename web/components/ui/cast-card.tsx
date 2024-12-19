import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { DateTime } from "@/components/ui/date-time"
import { getCastImages } from "@/lib/farcaster/get-cast-images"
import { getCastVideos } from "@/lib/farcaster/get-cast-videos"
import { Cast, Profile } from "@prisma/farcaster"
import { Grant } from "@prisma/flows"
import { VideoPlayer } from "./video-player"

interface Props {
  cast: Cast & { profile: Profile; grant?: Pick<Grant, "title" | "image"> | null }
}

export const CastCard = (props: Props) => {
  const { cast } = props

  const videos = getCastVideos(cast)
  const images = getCastImages(cast)

  return (
    <Card className="w-full break-inside-avoid">
      <CardHeader className="flex w-full flex-row items-center justify-between space-x-2.5 space-y-0 pb-2">
        <a
          className="flex items-center space-x-2.5 truncate transition-opacity hover:opacity-80"
          href={`https://warpcast.com/${cast.profile.fname}`}
          target="_blank"
        >
          <Avatar className="size-8">
            <AvatarImage
              src={cast.profile.avatar_url || ""}
              alt={cast.profile.display_name || ""}
            />
            <AvatarFallback>{cast.profile.display_name?.[0]}</AvatarFallback>
          </Avatar>
          <span className="truncate text-sm font-semibold">{cast.profile.display_name}</span>
        </a>
        <a
          href={`https://warpcast.com/${cast.profile.fname}/0x${cast.hash.toString("hex")}`}
          target="_blank"
          className="shrink-0 transition-opacity hover:opacity-80"
        >
          <DateTime
            date={cast.created_at}
            relative
            short
            className="text-sm text-muted-foreground"
          />
        </a>
      </CardHeader>
      <CardContent>
        <div className="whitespace-pre-line text-sm">{cast.text}</div>

        {((videos.length || 0) > 0 || (images.length || 0) > 0) && (
          <div className="mt-4 grid grid-cols-1 gap-2.5">
            {videos.map((video) => (
              <div key={video} className="h-auto w-full overflow-hidden rounded-lg">
                <VideoPlayer url={video} width="100%" height="100%" controls />
              </div>
            ))}
            {images.map((image) => (
              <a
                href={image}
                key={image}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-opacity hover:opacity-80"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image}
                  alt=""
                  className="h-auto w-full max-w-full rounded-lg"
                  loading="lazy"
                />
              </a>
            ))}
          </div>
        )}
        {/* {cast.grant && (
          <div className="mt-2.5 flex translate-y-1 justify-center md:translate-y-2.5">
            <Link href={`/item/${cast.grantId}`} className="group flex items-center space-x-2">
              <span className="text-xs text-muted-foreground transition-colors group-hover:text-foreground">
                {cast.grant.title}
              </span>
              <div style={{ width: `20px`, height: `20px` }}>
                <Image
                  src={getIpfsUrl(cast.grant.image)}
                  alt={cast.grant.title}
                  width={20}
                  height={20}
                  className="size-[20px] rounded-full object-cover"
                />
              </div>
            </Link>
          </div>
        )} */}
      </CardContent>
    </Card>
  )
}
