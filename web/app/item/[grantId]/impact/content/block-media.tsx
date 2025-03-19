import { VideoPlayer } from "@/components/ui/video-player"
import { cn } from "@/lib/utils"
import type { Impact } from "@prisma/flows"
import Image from "next/image"

interface Props {
  proofs: Impact["proofs"]
  name: string
}

export function BlockMedia(props: Props) {
  const { proofs, name } = props

  const images = proofs.flatMap((proof) => {
    return proof.images.map((image) => ({ ...image, proofUrl: proof.url }))
  })

  const videos = proofs.flatMap((proof) => {
    return proof.videos.map((video) => ({ ...video, proofUrl: proof.url }))
  })

  return (
    <div className="space-y-1.5">
      {videos.length > 0 && (
        <div className="grid grid-cols-1 gap-1.5">
          {videos.map((video) => (
            <div
              key={video.url}
              className={cn("relative w-full overflow-hidden", {
                "h-0 max-h-[500px]": videos.length > 1,
              })}
              style={{ paddingBottom: videos.length === 1 ? "100%" : "70%" }}
            >
              <VideoPlayer
                url={video.url}
                width="100%"
                height="100%"
                style={{ position: "absolute", top: 0, left: 0 }}
                controls
              />
            </div>
          ))}
        </div>
      )}
      <div className={cn("grid grid-cols-2 gap-1.5", { "md:grid-cols-1": images.length < 3 })}>
        {images.map((image) => (
          <a
            href={image.proofUrl}
            target="_blank"
            rel="noreferrer"
            key={`${image.url}`}
            className="transition-opacity hover:opacity-95"
          >
            <Image
              src={image.url}
              alt={name}
              width={330}
              height={330}
              className={cn("w-full object-cover max-sm:aspect-square max-sm:rounded-md", {
                "md:aspect-square": images.length >= 3,
              })}
            />
          </a>
        ))}
      </div>
    </div>
  )
}
