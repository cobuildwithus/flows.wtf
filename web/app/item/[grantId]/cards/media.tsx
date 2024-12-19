import { VideoPlayer } from "@/components/ui/video-player"
import { getIpfsUrl } from "@/lib/utils"
import Image from "next/image"

interface Props {
  media: Array<{ url: string; alt: string }>
}

export function Media(props: Props) {
  const { media } = props

  if (media.length < 3) return null

  return (
    <div className="col-span-full grid grid-cols-2 gap-3 lg:grid-cols-4">
      {media.map(({ url, alt }) => {
        const isVideo = url.endsWith("m3u8")

        return (
          <div className="relative aspect-square overflow-hidden rounded-xl" key={url}>
            {isVideo ? (
              <VideoPlayer
                url={url}
                controls
                className="overflow-hidden rounded-lg object-cover"
                width="100%"
                height="100%"
              />
            ) : (
              <Image
                src={getIpfsUrl(url, "pinata")}
                alt={alt}
                fill
                className="rounded-lg object-cover"
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
